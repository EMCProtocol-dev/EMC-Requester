<template>
  <div class="page">
    <div class="section">
      <div class="section-body">
        <n-card>
          <template #header>
            <h4><n-tag :bordered="false" type="success">Entry Point Echo</n-tag></h4>
          </template>
          <div class="part">
            <div class="part-header">
              <h4>Parameters</h4>
            </div>
            <n-table :single-line="false" bordered>
              <thead>
                <tr>
                  <th style="width: 20%; min-width: 10rem">Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="vertical-align: top">
                    <span style="font-weight: bold">input</span>
                  </td>
                  <td>
                    <n-input class="fieldinput" type="textarea" placeholder="anything" v-model:value="inputInput" />
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <div class="part">
            <n-button type="primary" size="large" :block="true" :loading="exeuting" @click="onPressExecute"> Execute </n-button>
          </div>
        </n-card>

        <n-card>
          <template #header> <h4>Response</h4> </template>
          <template v-if="responseData">
            <div class="part">
              <div class="part-body">
                <div class="response-general-info">
                  <span class="response-general-info-label">Request URL</span>
                  <n-tag :bordered="false"> {{ responseGeneral.requestUrl }} </n-tag>
                </div>
                <div class="response-general-info">
                  <span class="response-general-info-label">Request Method</span>
                  <n-tag :bordered="false"> {{ responseGeneral.requestMethod }} </n-tag>
                </div>
                <div class="response-general-info">
                  <span class="response-general-info-label">Status Code</span>
                  <n-tag :bordered="false"> {{ responseGeneral.statusCode }} </n-tag>
                </div>
              </div>
            </div>
            <n-tabs type="bar" size="small">
              <n-tab-pane name="formatted" tab="Data Formatted" tab-style="font-weight:bold">
                <FormatCode />
                <Code :code="responseDataFormatted" />
              </n-tab-pane>
              <n-tab-pane name="source" tab="Data Source" tab-style="font-weight:bold">
                <Code :code="responseData" />
              </n-tab-pane>
            </n-tabs>
          </template>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { NDescriptions, NDescriptionsItem, NTable, NTag, NInput, NButton, NCard, NCode, NTabs, NTabPane, NCollapse, NCollapseItem } from 'naive-ui';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import jsonFormat from 'json-format';
import Utils from '@/tools/utils';
import { useSettingStore } from '@/stores/app';
import { sendTelegram } from '@/tools/send';
import FormatCode from '@/components/format-code.vue';
import Code from '@/components/code.vue';
export default defineComponent({
  name: 'Echo',
  components: {
    NDescriptions,
    NDescriptionsItem,
    NTable,
    NTag,
    NInput,
    NButton,
    NCard,
    NCode,
    NTabs,
    NTabPane,
    NCollapse,
    NCollapseItem,
    FormatCode,
    Code,
  },
  setup() {
    hljs.registerLanguage('json', json);
    const settingStore = useSettingStore();
    const inputInput = ref('Hello EdgeMatrix');
    const exeuting = ref(false);
    const responseGeneral = ref({ requestUrl: '', requestMethod: '', statusCode: 0 });
    const responseData = ref('');
    const responseDataFormatted = ref('');
    const handlerExcute = async () => {
      const network = settingStore.network;
      const peerId = settingStore.peerId;
      const privateKey = settingStore.privateKey;
      const input = inputInput.value;
      if (!network) {
        //error
      }
      if (!peerId) {
        //error
      }
      if (!privateKey) {
        //error
      }
      if (!input) {
      }

      responseGeneral.value = { requestUrl: '', requestMethod: '', statusCode: 0 };
      responseData.value = '';
      responseDataFormatted.value = '';
      exeuting.value = true;
      const {
        _result,
        _desc,
        response = {},
      } = await sendTelegram({
        network,
        peerId,
        privateKey,
        endpoint: '/echo',
        input,
      });
      exeuting.value = false;
      const responseConfig = response.config || { url: '-', method: '-' };
      responseGeneral.value = {
        requestUrl: responseConfig.url,
        requestMethod: responseConfig.method.toUpperCase(),
        statusCode: response.status,
      };
      const teleRespData = response.data;
      const teleRespDataFormatted = Utils.responseFormatted({ ...response.data });
      responseData.value = typeof teleRespData === 'string' ? jsonFormat(teleRespData) : 'Response is not a json';;
      responseDataFormatted.value = jsonFormat(teleRespDataFormatted);
    };
    onMounted(() => {
      handlerExcute();
    });
    return {
      hljs,
      inputInput,
      exeuting,
      responseGeneral,
      responseData,
      responseDataFormatted,
      onPressExecute: handlerExcute,
    };
  },
});
</script>

<style scoped>
.section:not(:last-child) {
  margin-bottom: 32px;
}
.part {
  --n-th-font-weight: 500;
  --n-bezier: cubic-bezier(0.4, 0, 0.2, 1);
  --n-line-height: 1.6;
  --n-title-text-color: rgba(255, 255, 255, 0.9);
}

.part:not(:last-child) {
  margin-bottom: 16px;
}

.part-header {
  font-weight: var(--n-th-font-weight);
  font-size: 18px;
  transition: color 0.3s var(--n-bezier);
  line-height: var(--n-line-height);
  margin-bottom: 16px;
  color: var(--n-title-text-color);
}

.response-general-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}
.response-general-info-label {
  margin-right: 8px;
}

@media (prefers-color-scheme: light) {
  .part {
    --n-title-text-color: rgb(31, 34, 37);
  }
}
</style>
