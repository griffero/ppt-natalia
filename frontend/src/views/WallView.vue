<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import QRCode from "qrcode";
import { listCommitments, type Commitment } from "../lib/api";

const items = ref<Commitment[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const consecutiveFailures = ref(0);
const qrDataUrl = ref<string | null>(null);

const formUrl = computed(() => {
  const base = window.location.origin;
  return `${base}/`;
});

let timer: number | null = null;

async function refresh() {
  try {
    const next = await listCommitments();
    items.value = next;
    consecutiveFailures.value = 0;
    error.value = null;
  } catch (e) {
    consecutiveFailures.value += 1;
    // Avoid flashing the banner on a single transient failure (Render cold starts / deploys).
    if (consecutiveFailures.value >= 3) {
      error.value = e instanceof Error ? e.message : "Error";
    }
  } finally {
    loading.value = false;
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

onMounted(async () => {
  await refresh();
  timer = window.setInterval(refresh, 3000);
  qrDataUrl.value = await QRCode.toDataURL(formUrl.value, { margin: 1, width: 240 });
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<template>
  <div class="min-h-screen px-6 py-10">
    <div class="mx-auto w-full max-w-6xl">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
            Wall en vivo
          </div>
          <h1 class="mt-4 text-balance text-3xl font-semibold tracking-tight text-white">Compromisos</h1>
          <p class="mt-2 text-pretty text-sm text-zinc-300">
            La gente escanea el QR y escribe sus compromisos. Esto se actualiza automáticamente.
          </p>
          <div class="mt-4 flex items-center gap-3">
            <router-link class="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400" to="/">
              Nuevo compromiso
            </router-link>
            <button
              class="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-900"
              @click="refresh"
            >
              Refrescar
            </button>
            <span class="text-xs text-zinc-500" v-if="!loading">{{ items.length }} items</span>
          </div>
        </div>

        <div class="flex shrink-0 flex-col items-start gap-2 rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-white/10">
          <div class="text-sm font-semibold text-zinc-200">QR al formulario</div>
          <div class="text-xs text-zinc-400">{{ formUrl }}</div>
          <div class="mt-2 overflow-hidden rounded-xl bg-white p-3">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR" class="h-[240px] w-[240px]" />
            <div v-else class="h-[240px] w-[240px]" />
          </div>
        </div>
      </div>

      <div v-if="error" class="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
        {{ error }}
      </div>
      <div
        v-else-if="consecutiveFailures > 0"
        class="mt-6 rounded-xl bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300 ring-1 ring-white/10"
      >
        Reconectando…
      </div>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="c in items"
          :key="c.id"
          class="group relative overflow-hidden rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-white/10"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="inline-flex items-center gap-2">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/15 text-sm font-bold text-indigo-200 ring-1 ring-indigo-500/30">
                {{ c.initials }}
              </div>
              <div class="text-xs text-zinc-500">{{ formatTime(c.createdAt) }}</div>
            </div>
          </div>
          <div class="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">
            {{ c.text }}
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-10 text-sm text-zinc-400">Cargando…</div>
      <div v-else-if="items.length === 0" class="mt-10 text-sm text-zinc-400">Todavía no hay compromisos.</div>
    </div>
  </div>
</template>


