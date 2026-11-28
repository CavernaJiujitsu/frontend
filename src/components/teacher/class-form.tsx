import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { queryClient } from "@/api/bootstrap/query-client";
import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import { listBelts } from "@/api/services/belts.service";
import {
  createClass,
  replaceClassBelts,
  updateClass,
  type BackendClass,
  type ClassType,
} from "@/api/services/classes.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { FormField } from "@/components/customized/form-field/form-field";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { Chip, ui } from "@/components/teacher/teacher-ui";
import { BrandColors } from "@/constants/theme";
import { teacherKeys, useCurrentTeacher } from "@/hooks/use-teacher-data";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { parseDateTime, toDateInput, toTimeInput } from "@/utils/date-time";
import { notify } from "@/utils/dialogs";

const CLASS_TYPES: { value: ClassType; label: string }[] = [
  { value: "SCHEDULED", label: "Treino" },
  { value: "VALIDATION", label: "Validação de faixa" },
  { value: "EXAM", label: "Exame" },
];

function initialDates(existing?: BackendClass) {
  if (existing) {
    const start = new Date(existing.startsAt);
    return {
      date: toDateInput(start),
      start: toTimeInput(start),
      end: toTimeInput(new Date(existing.endsAt)),
    };
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: toDateInput(tomorrow), start: "19:00", end: "20:30" };
}

/** Create form when `existing` is undefined, edit form otherwise. */
export function ClassForm({ existing }: { existing?: BackendClass }) {
  const router = useRouter();
  const teacherId = useAppStore((state) => state.user.teacherId);
  const teacherQuery = useCurrentTeacher();
  const beltsQuery = useQuery({ queryKey: ["belts"], queryFn: listBelts, staleTime: Infinity });
  const catalog = useQuery({ queryKey: ["graduation-catalog"], queryFn: async () => {
    const { data } = await apiClient.get<ApiEnvelope<{ belts: { id: string; name: string }[]; trails: { belt: { id: string }; stages?: { movements?: { id: string; movement: { name: string } }[] }[] }[] }>>("/api/v1/graduation-catalog");
    return unwrap(data);
  } });
  const content = useQuery({ queryKey: ["class-content", existing?.id], enabled: Boolean(existing), queryFn: async () => {
    const { data } = await apiClient.get<ApiEnvelope<{ trailStageMovement: { id: string } }[]>>(`/api/v1/classes/${existing!.id}/content`);
    return unwrap(data).map((item) => item.trailStageMovement.id);
  } });
  const [selectedMovements, setSelectedMovements] = useState<string[] | null>(null);
  const selected = selectedMovements ?? content.data ?? [];
  const [createdId, setCreatedId] = useState<string | null>(null);

  const defaults = initialDates(existing);
  const initialBeltIds = (existing?.belts ?? [])
    .map((item) => item.belt?.id)
    .filter((id): id is string => Boolean(id));
  const [caveUnitId, setCaveUnitId] = useState(existing?.caveUnit?.id ?? "");
  const [type, setType] = useState<ClassType>(existing?.type ?? "SCHEDULED");
  const [date, setDate] = useState(defaults.date);
  const [startTime, setStartTime] = useState(defaults.start);
  const [endTime, setEndTime] = useState(defaults.end);
  const [capacity, setCapacity] = useState(String(existing?.capacity ?? 20));
  const [beltIds, setBeltIds] = useState<string[]>(initialBeltIds);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const startsAt = parseDateTime(date, startTime);
      const endsAt = parseDateTime(date, endTime);
      const capacityValue = Number(capacity);
      if (!existing && !caveUnitId) throw new Error("Escolha a unidade da aula.");
      if (!startsAt || !endsAt) throw new Error("Use data DD/MM/AAAA e horários HH:MM.");
      if (endsAt <= startsAt) throw new Error("O término deve ser depois do início.");
      if (!Number.isInteger(capacityValue) || capacityValue < 1) {
        throw new Error("Informe uma capacidade de pelo menos 1 aluno.");
      }

      if (type === "SCHEDULED" && (catalog.isLoading || catalog.isError || (existing && (content.isLoading || content.isError)))) throw new Error("Não foi possível carregar os movimentos. Tente novamente.");
      if (!existing && !createdId) {
        const created = await createClass({
          caveUnitId,
          teacherId: teacherId!,
          type,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          capacity: capacityValue,
          ...(beltIds.length ? { beltIds } : {}),
        });
        setCreatedId(created.id);
        if (type === "SCHEDULED") await apiClient.put(`/api/v1/classes/${created.id}/content`, { trailStageMovementIds: selected });
        return created;
      }
      const id = existing?.id ?? createdId!;
      const updated = await updateClass(id, {
        type,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        capacity: capacityValue,
      });
      const beltsChanged =
        [...beltIds].sort().join() !== [...initialBeltIds].sort().join();
      if (beltsChanged) await replaceClassBelts(id, beltIds);
      if (type === "SCHEDULED" && (!existing || [...selected].sort().join() !== [...(content.data ?? [])].sort().join())) await apiClient.put(`/api/v1/classes/${id}/content`, { trailStageMovementIds: selected });
      return updated;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.classes });
      if (existing) await queryClient.invalidateQueries({ queryKey: ["class", existing.id] });
      notify(existing ? "Aula atualizada" : "Aula criada");
      router.replace("/professor/aulas");
    },
    onError: (error) =>
      setFormError(backendMessage(error, "Não foi possível salvar a aula.")),
  });

  const toggleBelt = (id: string) =>
    setBeltIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  if (teacherQuery.isLoading) return <LoadingSpinner label="Carregando suas unidades…" />;
  const units = teacherQuery.data?.caveUnits ?? [];

  return (
    <View style={{ gap: 16 }}>
      <View style={s.card}>
        <Text style={ui.label}>UNIDADE</Text>
        {existing ? (
          <Text style={s.body}>
            {existing.caveUnit?.name ?? "Unidade"} (a unidade não pode ser alterada)
          </Text>
        ) : units.length === 0 ? (
          <Text style={s.body}>
            Você ainda não está vinculado a nenhuma unidade. Peça ao administrador da
            caverna para vincular você.
          </Text>
        ) : (
          <View style={ui.row}>
            {units.map((unit) => (
              <Chip
                key={unit.id}
                label={`${unit.caveName} • ${unit.name}`}
                selected={caveUnitId === unit.id}
                onPress={() => setCaveUnitId(unit.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={s.card}>
        <Text style={ui.label}>TIPO</Text>
        <View style={ui.row}>
          {CLASS_TYPES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={type === option.value}
              onPress={() => setType(option.value)}
            />
          ))}
        </View>
        {type !== "SCHEDULED" ? (
          <Text style={s.body}>
            Aulas de validação e treinos podem receber agendamentos de validação de faixa.
          </Text>
        ) : null}
      </View>

      <FormField label="DATA (DD/MM/AAAA)" value={date} onChangeText={setDate} placeholder="25/11/2026" keyboardType="numbers-and-punctuation" />
      <View style={ui.row}>
        <FormField label="INÍCIO" value={startTime} onChangeText={setStartTime} placeholder="19:00" width={48} keyboardType="numbers-and-punctuation" />
        <FormField label="TÉRMINO" value={endTime} onChangeText={setEndTime} placeholder="20:30" width={48} keyboardType="numbers-and-punctuation" />
      </View>
      <FormField label="CAPACIDADE" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />

      <View style={s.card}>
        <Text style={ui.label}>FAIXAS ELEGÍVEIS (OPCIONAL)</Text>
        <Text style={s.body}>Sem seleção, a aula fica aberta para todas as faixas.</Text>
        <View style={ui.row}>
          {(beltsQuery.data ?? []).map((belt) => (
            <Chip
              key={belt.id}
              label={belt.name}
              selected={beltIds.includes(belt.id)}
              onPress={() => toggleBelt(belt.id)}
            />
          ))}
        </View>
      </View>

      {type === "SCHEDULED" ? <View style={s.card}>
        <Text style={ui.label}>MOVIMENTOS ENSINADOS POR FAIXA</Text>
        <Text style={s.body}>Selecione os movimentos ensinados antes de confirmar presenças.</Text>
        {catalog.isLoading || content.isLoading && existing ? <Text style={s.body}>Carregando movimentos…</Text> : null}
        {catalog.isError || content.isError ? <Text style={s.body}>Não foi possível carregar os movimentos.</Text> : null}
        {(catalog.data?.belts ?? []).map((belt) => <View key={belt.id}>
          <Text style={s.title}>{belt.name}</Text>
          <View style={ui.row}>{(catalog.data?.trails.find((trail) => trail.belt.id === belt.id)?.stages ?? []).flatMap((stage) => stage.movements ?? []).map((movement) => <Chip key={movement.id} label={movement.movement.name} selected={selected.includes(movement.id)} onPress={() => setSelectedMovements(selected.includes(movement.id) ? selected.filter((id) => id !== movement.id) : [...selected, movement.id])} />)}</View>
        </View>)}
      </View> : null}

      {formError ? (
        <Text style={[s.body, { color: BrandColors.danger }]} accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}

      <DefaultButton
        label={mutation.isPending ? "Salvando…" : existing ? "Salvar alterações" : "Criar aula"}
        color={BrandColors.secondary}
        disabled={mutation.isPending}
        action={() => {
          setFormError(null);
          mutation.mutate();
        }}
      />
    </View>
  );
}
