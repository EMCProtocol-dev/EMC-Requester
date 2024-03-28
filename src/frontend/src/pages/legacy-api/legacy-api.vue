<template>
  <div class="page">
    <template v-if="error > 0">
      <div class="page-error">
        <n-h4 class="page-error-info">{{ errorText }}</n-h4>
      </div>
    </template>
    <template v-if="error === 0">
      <div class="section">
        <div class="section-body">
          <n-card>
            <template #header>
              <n-tag type="success" style="margin-right: 8px">
                <h4>{{ idlMethod }}</h4>
              </n-tag>
              <n-tag :bordered="false" type="success"
                ><h4>Entry Point Legacy API - {{ idlPath }}</h4></n-tag
              >
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
                  <template v-if="idlPath === '*'">
                    <tr style="vertical-align: top">
                      <td>
                        <span style="font-weight: bold">path</span>
                      </td>
                      <td>
                        <span style="font-weight: bold">Enter your inside api path</span>
                        <n-input
                          class="fieldinput"
                          type="textarea"
                          placeholder="Example:/api/img/transfer"
                          v-model:value="inputPath"
                        />
                      </td>
                    </tr>
                  </template>
                  <template v-if="idlMethod === '*'">
                    <tr style="vertical-align: top">
                      <td>
                        <span style="font-weight: bold">method</span>
                      </td>
                      <td>
                        <span style="font-weight: bold">Enter your inside api method</span>
                        <n-input
                          class="fieldinput"
                          type="textarea"
                          placeholder="POST / GET"
                          v-model:value="inputMethod"
                        />
                      </td>
                    </tr>
                  </template>
                  <tr style="vertical-align: top">
                    <td>
                      <span style="font-weight: bold">body</span>
                    </td>
                    <td>
                      <span style="font-weight: bold">{{ idlBodyRawDesc }}</span>
                      <n-input class="fieldinput" type="textarea" placeholder="{}" v-model:value="idlBodyRawInput" />
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </div>
            <div class="part">
              <n-button type="primary" size="large" :block="true" :loading="exeuting" @click="onPressExecute">
                Execute
              </n-button>
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
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from 'vue';
import {
  NH4,
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
} from 'naive-ui';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import jsonFormat from 'json-format';
import Utils from '@/tools/utils';
import { useRoute } from 'vue-router';
import FormatCode from '@/components/format-code.vue';
import Code from '@/components/code.vue';
import { useSettingStore, useIDLStore } from '@/stores/app';
import { sendTelegram } from '@/tools/send';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'Api',
  components: {
    NH4,
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

    const error = ref(-1);
    const errorText = ref('');

    const exeuting = ref(false);

    const inputPath = ref('');
    const inputMethod = ref('');

    const idlPath = ref('');
    const idlMethod = ref('METHOD');
    const idlBodyRawDesc = ref('');
    const idlBodyRawInput = ref('');

    const responseGeneral = ref<ResponseGeneral>({ requestUrl: '', requestMethod: '', statusCode: 0 });
    const responseData = ref('');
    const responseDataFormatted = ref('');
    const route = useRoute();
    const idlStore = useIDLStore();
    watch(
      () => route.params,
      (val, oldVal) => {
        console.info('api route change--->', val);
        error.value = -1;
        errorText.value = '';
        exeuting.value = false;
        inputPath.value = '';
        inputMethod.value = '';
        responseGeneral.value = {
          requestUrl: '',
          requestMethod: '',
          statusCode: 0,
        };
        responseData.value = '';
        responseDataFormatted.value = '';

        const key = val.key;
        const idl = idlStore.idl.find((item: any) => item._key === key);
        if (idl) {
          idlPath.value = idl.path;
          idlMethod.value = idl.method;
          idlBodyRawDesc.value = idl.rawDesc;
          idlBodyRawInput.value = idl.rawExample;
          error.value = 0;
        } else {
          idlPath.value = '';
          idlMethod.value = '';
          idlBodyRawDesc.value = '';
          idlBodyRawInput.value = '';
          error.value = 404;
          errorText.value = `Can not found IDL api with url parameter key: ${key}`;
        }
      },
      {
        immediate: true,
      }
    );

    return {
      hljs,
      error,
      errorText,
      exeuting,
      inputPath,
      inputMethod,
      idlPath,
      idlMethod,
      idlBodyRawDesc,
      idlBodyRawInput,
      responseGeneral,
      responseData,
      responseDataFormatted,
      onPressExecute: async () => {
        const network = settingStore.network;
        const peerId = settingStore.peerId;
        const privateKey = settingStore.privateKey;
        const path = idlPath.value === '*' ? inputPath.value : idlPath.value;
        const method = idlMethod.value === '*' ? inputMethod.value : idlMethod.value;
        const bodyRaw = idlBodyRawInput.value;

        if (!network) {
          //error
        }
        if (!peerId) {
          //error
        }
        if (!privateKey) {
          //error
        }
        if (!path) {
          //error
        }
        if (!method) {
          //error
        }

        const input: any = {
          path,
          method,
          headers: [],
          body: Utils.parseJSON(bodyRaw) || bodyRaw || '',
        };

        responseGeneral.value = { requestUrl: '', requestMethod: '', statusCode: 0 };
        responseData.value = '';
        responseDataFormatted.value = '';

        exeuting.value = true;
        const { _result, _desc, response } = await sendTelegram({
          network,
          peerId,
          privateKey,
          endpoint: '/api',
          input: input,
        });
        exeuting.value = false;

        responseGeneral.value = {
          requestUrl: response.config.url,
          requestMethod: response.config.method.toUpperCase(),
          statusCode: response.status,
        };
        const teleRespData = response.data;
        const teleRespDataFormatted = Utils.responseFormatted({ ...response.data });
        responseData.value = jsonFormat(teleRespData);
        responseDataFormatted.value = jsonFormat(teleRespDataFormatted);
      },
    };
  },
});
</script>

<style scoped>
.page-error {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.section:not(:last-child) {
  margin-bottom: 32px;
}
.setting-item {
}
.setting-item-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.setting-item:not(:last-child) {
  margin-bottom: 16px;
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

.code-wrapper {
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.1);
}

@media (prefers-color-scheme: light) {
  .part {
    --n-title-text-color: rgb(31, 34, 37);
  }
  .code-wrapper {
    background-color: #eee;
  }
}
</style>
