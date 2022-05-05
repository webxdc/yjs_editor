<script setup lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css'

import { VueGoodTable } from 'vue-good-table-next'
import { ref } from 'vue'

const columns = ref([
  {
    label: 'Timestamp',
    field: 'ts',
    type: 'number',
  },
  {
    label: 'Type',
    field: 'event_type',
    type: 'number',
    dateInputFormat: 'T',
    dateOutputFormat: 'MMM do yyyy',
  },
  {
    label: 'Data 1',
    field: 'data1',
    type: 'number',
  },
  {
    label: 'Data 2',
    field: 'data2',
    type: 'number',
  },
])

const data = ref([] as LogData[])

const rows2 = computed(() => {
  return data.value.map((row) => {
    return {
      data1: row.payload.data1,
      data2: row.payload.data2,
      event_type: row.payload.event_type,
      ts: row.payload.ts,
    }
  })
})

const options = {
  enabled: true,
  skipDiacritics: true,
}

interface LogData {
  payload: {
    data1: Number
    data2: Number
    event_type: String
    ts: Number
  }
}

/* window.webxdc.sendUpdate({
  payload: {
    data1: 'hi',
    data2: 'du',
    event_type: 'hello',
    ts: 123,
  },
}, `${window.webxdc.selfName} just published changes to the shared document`)
 */
function receiveUpdate(log_data: LogData) {
  // eslint-disable-next-line no-console
  console.log('new logs received')
  data.value.push(log_data)
}

onMounted(() => {
  window.webxdc.setUpdateListener(receiveUpdate, 0)
})
</script>

<template lang="pug">
h1.text-2xl Current device logs
div
  vue-good-table(
    :columns="columns"
    :rows="rows2"
    :search-options = "options"
    )
div
  | {{data}}
</template>
