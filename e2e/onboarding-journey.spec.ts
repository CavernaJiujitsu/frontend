import { expect, test, type Page } from "@playwright/test";

import {
  discoverValidationClass,
  scheduleMonthFor,
  type ValidationClass,
} from "./support/validation-class";

type Student = {
  firstName: string;
  fullName: string;
  email: string;
  password: string;
};

const PASSWORD = "E2eTeste123";

/** A fresh e-mail per execution: the suite never reuses or deletes accounts. */
function newStudent(label: string): Student {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    firstName: "Aluno",
    fullName: `Aluno E2E ${label}`,
    email: `e2e-${label}-${unique}@teste.caverna`,
    password: PASSWORD,
  };
}

async function createAccount(page: Page, student: Student): Promise<void> {
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding\/start/);

  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/onboarding\/welcome/);

  await page.getByText("Pular", { exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding\/create-account/);

  await page.getByPlaceholder("Seu nome").fill(student.fullName);
  await page.getByPlaceholder("seuemail@exemplo.com").fill(student.email);
  await page.getByPlaceholder("••••••••").fill(student.password);
  await page.getByRole("button", { name: "Criar conta" }).click();

  // The location screen requests the permission as soon as it opens, so with a
  // granted permission it can already be on the next route by the time we
  // assert. Each scenario waits for its own destination below.
  await expect(page).toHaveURL(
    /\/onboarding\/(location-permission|nearby-gym)/,
    { timeout: 60_000 },
  );
}

async function chooseCave(page: Page, caveName: string): Promise<void> {
  await expect(page).toHaveURL(/\/onboarding\/nearby-gym/);
  await expect(page.getByText("Escolha sua caverna")).toBeVisible();

  await page.getByLabel("Buscar caverna...").fill(caveName);
  const caveCard = page.getByRole("button", { name: caveName, exact: true });
  await expect(caveCard).toBeVisible({ timeout: 30_000 });
  await caveCard.click();

  await expect(page).toHaveURL(/\/onboarding\/select-belt/);
  await expect(page.getByText("Qual sua faixa atual?")).toBeVisible();
}

async function declareNoGraduation(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Não tenho graduação/ }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  await expect(page).toHaveURL(/\/onboarding\/schedule/);
  await expect(page.getByText("Escolha o dia e horário")).toBeVisible();
}

async function openTargetDay(page: Page, target: ValidationClass): Promise<void> {
  const current = scheduleMonthFor(new Date());
  if (current.year !== target.localYear) {
    throw new Error(
      "The schedule screen only lists months of the current year; the seeded class crosses the year boundary.",
    );
  }

  if (current.month !== target.localMonth) {
    await page
      .getByRole("button", { name: /^Selecionar mês, mês atual/ })
      .click();
    await page
      .getByRole("button", { name: `Selecionar mês ${target.monthLabel}` })
      .click();
  }

  const dayButton = page.getByRole("button", {
    name: new RegExp(`^Selecionar dia ${target.localDay} `),
  });
  await expect(dayButton).toBeVisible();
  await dayButton.click();
}

async function bookValidationClass(
  page: Page,
  target: ValidationClass,
): Promise<void> {
  await expect(page.getByText(`Escolha sua caverna — ${target.caveName}`)).toBeVisible();
  await openTargetDay(page, target);

  const enrollButton = page.getByRole("button", {
    name: `Inscrever na aula das ${target.timeLabel} com ${target.teacherName}`,
    exact: true,
  });
  await expect(enrollButton).toBeVisible({ timeout: 30_000 });
  await enrollButton.click();

  await expect(page).toHaveURL(/\/inicio/, { timeout: 60_000 });
}

async function expectBookedHome(
  page: Page,
  target: ValidationClass,
  student: Student,
): Promise<void> {
  await expect(page.getByText(`Olá, ${student.firstName} 👋`)).toBeVisible();

  // Scope the class assertions to the "PRÓXIMA AULA" card: the same cave name
  // may also appear in the nearby-caves card below.
  const nextClassCard = page
    .getByText("PRÓXIMA AULA", { exact: true })
    .locator("..");
  await expect(nextClassCard.getByText(target.homeWhenLabel, { exact: true })).toBeVisible();
  await expect(nextClassCard.getByText("Inscrição pendente")).toBeVisible();
  await expect(nextClassCard.getByText(`Prof. ${target.teacherName}`, { exact: true })).toBeVisible();
  await expect(nextClassCard.getByText(target.caveName, { exact: true })).toBeVisible();
  await expect(page.getByText("Avaliação pendente")).toBeVisible();
}

test.describe("location granted", () => {
  test.use({
    geolocation: { latitude: -23.5505, longitude: -46.6333 },
    permissions: ["geolocation"],
  });

  test("signs up and books a validation class", async ({ page }) => {
    test.setTimeout(240_000);
    const target = await discoverValidationClass();
    const student = newStudent("granted");

    await createAccount(page, student);
    await expect(page).toHaveURL(/\/onboarding\/nearby-gym/, {
      timeout: 60_000,
    });
    // The automatically granted location was saved: the cards show distances.
    await expect(page.getByText(/\d,\d km/).first()).toBeVisible({
      timeout: 30_000,
    });
    await chooseCave(page, target.caveName);
    await declareNoGraduation(page);
    await bookValidationClass(page, target);
    await expectBookedHome(page, target, student);
  });
});

test.describe("location denied", () => {
  test.use({ permissions: [] });

  test("continues without location and still books a validation class", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const target = await discoverValidationClass();
    const student = newStudent("denied");
    const dialogs: string[] = [];

    page.on("dialog", (dialog) => {
      dialogs.push(dialog.message());
      void dialog.dismiss();
    });

    await createAccount(page, student);
    await expect(page).toHaveURL(/\/onboarding\/location-permission/);
    await expect
      .poll(
        () =>
          dialogs.some((message) =>
            message.includes("Não foi possível acessar sua localização"),
          ),
        { timeout: 30_000 },
      )
      .toBe(true);

    await page.getByText("Agora não, prefiro buscar manualmente").click();
    await expect(page).toHaveURL(/\/onboarding\/nearby-gym/, {
      timeout: 30_000,
    });

    await chooseCave(page, target.caveName);
    await declareNoGraduation(page);
    await bookValidationClass(page, target);
    await expectBookedHome(page, target, student);
  });
});
