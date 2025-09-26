<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { CARD_TYPES, type CardType } from '../api';

const emit = defineEmits<{
  typeChanged: [type: CardType]
}>();

const selectedType = ref<CardType>('PERFORMANCE_SERVICE');

const cardTypeOptions = [
  { label: 'Service de Performance', value: 'PERFORMANCE_SERVICE' },
  { label: 'Service de Suppression', value: 'DELETE_SERVICE' },
  { label: 'Par Défaut', value: 'DEFAULT' }
];

const onTypeChange = () => {
  emit('typeChanged', selectedType.value);
};

onMounted(() => {
  // Émettre le type initial
  emit('typeChanged', selectedType.value);
});
</script>

<template>
  <div class="flex align-items-center gap-3 mb-3">
    <label for="cardType" class="font-semibold">Type de métrique :</label>
    <Dropdown
      id="cardType"
      v-model="selectedType"
      :options="cardTypeOptions"
      option-label="label"
      option-value="value"
      @change="onTypeChange"
      class="w-12rem"
    />
    <Button
      icon="pi pi-refresh"
      @click="onTypeChange"
      severity="secondary"
      outlined
      size="small"
      v-tooltip.top="'Actualiser'"
    />
  </div>
</template>