<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { createCommitment } from "../lib/api";

const router = useRouter();

const initials = ref("");
const commitments = ref("");
const isSubmitting = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const canSubmit = computed(() => initials.value.trim().length > 0 && commitments.value.trim().length > 0 && !isSubmitting.value);

async function onSubmit() {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  error.value = null;
  try {
    await createCommitment({ initials: initials.value, commitments: commitments.value });
    success.value = true;
    await router.push("/wall");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Error";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen px-6 py-10">
    <div class="mx-auto w-full max-w-xl">
      <div class="mb-8">
        <div class="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
          Compromisos
        </div>
        <h1 class="mt-4 text-balance text-3xl font-semibold tracking-tight text-white">Escribe tus compromisos</h1>
        <p class="mt-2 text-pretty text-sm text-zinc-300">
          Pon tus iniciales y uno o varios compromisos. Se verán en el wall en tiempo real.
        </p>
      </div>

      <form class="space-y-4 rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-white/10" @submit.prevent="onSubmit">
        <div>
          <label class="mb-2 block text-sm font-medium text-zinc-200">Tus iniciales</label>
          <input
            v-model="initials"
            class="w-full rounded-xl bg-zinc-950 px-4 py-3 text-white ring-1 ring-white/10 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: CN"
            maxlength="6"
            autocomplete="off"
          />
          <p class="mt-1 text-xs text-zinc-500">Máximo 6 caracteres. Se transformará a MAYÚSCULAS.</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-zinc-200">Tus compromisos</label>
          <textarea
            v-model="commitments"
            class="min-h-40 w-full resize-none rounded-xl bg-zinc-950 px-4 py-3 text-white ring-1 ring-white/10 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej:\n- Pedir feedback antes de cerrar\n- Documentar cambios importantes"
            maxlength="800"
          />
          <p class="mt-1 text-xs text-zinc-500">Puedes usar guiones o escribir en texto libre.</p>
        </div>

        <div v-if="error" class="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
          {{ error }}
        </div>

        <div class="flex items-center gap-3">
          <button
            class="inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canSubmit"
            type="submit"
          >
            <span v-if="!isSubmitting">Publicar en el wall</span>
            <span v-else>Publicando…</span>
          </button>
          <router-link
            class="inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-900"
            to="/wall"
          >
            Ver wall
          </router-link>
        </div>
      </form>

      <p v-if="success" class="mt-4 text-sm text-emerald-200">Listo: publicado.</p>
    </div>
  </div>
</template>


