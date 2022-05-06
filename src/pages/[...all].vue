<script setup lang="ts">
import 'vue-good-table-next/dist/vue-good-table-next.css'

import { VueGoodTable } from 'vue-good-table-next'
import { ref } from 'vue'
import { stump_data } from '~/stump'

const columns = ref([
  {
    label: 'Timestamp',
    field: 'ts',
    type: 'date',
    dateInputFormat: 'T',
    dateOutputFormat: 'E H:m:ss',
    sortable: false,
  },
  {
    label: 'Type',
    field: 'event_type',
    type: 'number',
    sortable: false,
  },
  {
    label: 'Data 1',
    field: 'data1',
    type: 'number',
    sortable: false,
  },
  {
    label: 'Data 2',
    field: 'data2',
    type: 'number',
    sortable: false,
  },
])

const dev = true
const data = ref([] as usedData[])

const options = {
  enabled: true,
  skipDiacritics: true,
}

interface LogData {
  payload: {
    data1: any
    data2: any
    event_type: any
    ts: Number
  }
}

interface usedData {
  data1: any
  data2: any
  event_type: any
  ts: Number
}

function receiveUpdate(log_data: LogData) {
  // eslint-disable-next-line no-console
  console.log('new logs received')
  data.value.push(transformData(log_data))
}

function transformData(log_data: LogData) {
  return log_data.payload
}

onMounted(() => {
  window.webxdc.setUpdateListener(receiveUpdate, 0)

  if (import.meta.env.DEV) {
    stump_data.forEach((row) => {
      data.value.push(transformData(row))
    })
  }
})
</script>

<template lang="pug">
div
  h1.text-2xl.leading-none.mb-1 Current device logs
  div
    VueGoodTable(
      :columns="columns"
      :rows="data"
      :search-options = "options"
      compactMode
    )
</template>

<style lang="sass">

table.vgt-table td
  padding: 2px !important

thead
  display: none

.vgt-right-align
  text-align: left !important

.vgt-global-search__input
  padding-left: 5px !important

.magnifying-glass
  display: none !important
</style>
