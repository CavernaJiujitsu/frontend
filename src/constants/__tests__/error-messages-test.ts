import type { AppError } from "@/api/types/api-error";
import {
  displayableBackendMessage,
  getErrorMessage,
  GENERIC_ERROR_MESSAGE,
  INVALID_DATA_MESSAGE,
  OFFLINE_MESSAGE,
  SERVER_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  TIMEOUT_MESSAGE,
} from "@/constants/error-messages";

const http = (status: number, message?: string): AppError => ({
  kind: "http",
  status,
  message,
});

describe("getErrorMessage: backend business messages (PT-BR) are shown", () => {
  it.each([
    [401, "E-mail ou senha inválidos"],
    [403, "Você não tem permissão para gerenciar esta aula"],
    [404, "Aula não encontrada"],
    [409, "Aula lotada"],
    [409, "Aluno já inscrito nesta aula"],
    [409, "Faixa atual do aluno não é elegível para esta aula"],
    [409, "Email já cadastrado"],
    [400, "Apenas arquivos JPG, PNG ou PDF são permitidos!"],
    [429, "Muitas tentativas de login. Tente novamente mais tarde"],
    [503, "Login temporariamente indisponível"],
  ])("%i %s", (status, message) => {
    expect(getErrorMessage(http(status, message))).toBe(message);
  });

  it("a 401 is never turned into 'Credenciais inválidas'", () => {
    expect(getErrorMessage(http(401, "E-mail ou senha inválidos"))).not.toMatch(
      /Credenciais inválidas/,
    );
  });

  it("a 409 is never turned into 'Essa caverna já existe'", () => {
    expect(getErrorMessage(http(409, "Aula lotada"))).not.toMatch(/caverna/i);
  });

  it("drops repeated segments of a PT-only validation message", () => {
    expect(
      getErrorMessage(
        http(400, "Credenciais inválidas; Credenciais inválidas; Credenciais inválidas"),
      ),
    ).toBe("Credenciais inválidas");
  });
});

describe("getErrorMessage: technical English messages are hidden", () => {
  it.each([
    [400, "property academyUnitId should not exist"],
    [400, "email must be an email"],
    [400, "practitionerId must be a UUID"],
    [400, "Validation failed (uuid is expected)"],
    [400, "JSON Parse error: Expected '}'"],
  ])("%i %s → generic invalid-data text", (status, message) => {
    expect(getErrorMessage(http(status, message))).toBe(INVALID_DATA_MESSAGE);
  });

  it("hides a mixed EN/PT message entirely (real login body for {})", () => {
    const message =
      "email must be shorter than or equal to 160 characters; email must be an email; E-mail não pode conter espaços; Credenciais inválidas; Credenciais inválidas; Credenciais inválidas";
    expect(getErrorMessage(http(400, message))).toBe(INVALID_DATA_MESSAGE);
  });

  it("hides a nested DTO message (real signup body)", () => {
    expect(
      getErrorMessage(http(400, "user.email must be an email; user.E-mail não pode conter espaços")),
    ).toBe(INVALID_DATA_MESSAGE);
  });

  it("404 'Cannot GET' → generic not-found text", () => {
    expect(getErrorMessage(http(404, "Cannot GET /api/v1/does-not-exist"))).toBe(
      "Não encontramos o que você procurava.",
    );
  });

  it("403 'Forbidden resource' → generic permission text", () => {
    expect(getErrorMessage(http(403, "Forbidden resource"))).toBe(
      "Você não tem permissão para essa ação.",
    );
  });

  it("429 throttler default → generic rate-limit text", () => {
    expect(getErrorMessage(http(429, "ThrottlerException: Too Many Requests"))).toBe(
      "Muitas tentativas. Aguarde um pouco e tente novamente.",
    );
  });

  it("500 'Internal server error' → server error text", () => {
    expect(getErrorMessage(http(500, "Internal server error"))).toBe(
      SERVER_ERROR_MESSAGE,
    );
  });
});

describe("getErrorMessage: fallback and missing message", () => {
  it("uses the screen fallback when the backend message is technical", () => {
    expect(
      getErrorMessage(http(400, "email must be an email"), "Não foi possível salvar a aula."),
    ).toBe("Não foi possível salvar a aula.");
  });

  it("prefers the backend business message over the fallback", () => {
    expect(getErrorMessage(http(409, "Aula lotada"), "Tente novamente.")).toBe(
      "Aula lotada",
    );
  });

  it("uses a generic text by status when there is no message", () => {
    expect(getErrorMessage(http(409))).toBe(
      "Essa ação entra em conflito com o estado atual.",
    );
    expect(getErrorMessage(http(502))).toBe(SERVER_ERROR_MESSAGE);
    expect(getErrorMessage(http(418))).toBe(GENERIC_ERROR_MESSAGE);
  });

  it("unknown errors use the fallback, then the generic text", () => {
    expect(getErrorMessage({ kind: "unknown" }, "Não foi possível carregar.")).toBe(
      "Não foi possível carregar.",
    );
    expect(getErrorMessage({ kind: "unknown" })).toBe(GENERIC_ERROR_MESSAGE);
  });
});

describe("getErrorMessage: session and connection states", () => {
  it("expired session ignores the backend text and the fallback", () => {
    expect(
      getErrorMessage(
        { kind: "session-expired", status: 401, message: "Token de acesso inválido" },
        "Tente novamente.",
      ),
    ).toBe(SESSION_EXPIRED_MESSAGE);
  });

  it("offline and timeout win over the fallback", () => {
    expect(getErrorMessage({ kind: "offline" }, "Tente novamente.")).toBe(OFFLINE_MESSAGE);
    expect(getErrorMessage({ kind: "timeout" }, "Tente novamente.")).toBe(TIMEOUT_MESSAGE);
  });
});

describe("displayableBackendMessage", () => {
  it("returns undefined for empty input", () => {
    expect(displayableBackendMessage(undefined)).toBeUndefined();
    expect(displayableBackendMessage(" ; ")).toBeUndefined();
  });

  it("keeps PT messages that mention field names", () => {
    expect(displayableBackendMessage("startsAt deve estar no formato HH:mm ou HH:mm:ss")).toBe(
      "startsAt deve estar no formato HH:mm ou HH:mm:ss",
    );
  });
});
