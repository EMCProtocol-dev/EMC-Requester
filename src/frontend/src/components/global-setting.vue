<template>
  <n-card title="Setting" style="width: 600px" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <n-form ref="formRef" :model="formData" :rules="formRule">
      <n-form-item path="network" label="Network" style="margin-bottom: 16px">
        <n-input v-model:value="formData.network" @keydown.enter.prevent />
      </n-form-item>

      <n-form-item path="peerId" label="Node ID" :show-label="false" style="margin-bottom: 16px">
        <div style="width: 100%">
          <div class="n-form-item-label" style="align-items: center; justify-content: space-between">
            <label class="n-form-item-label--right-mark"
              ><span class="n-form-item-label__text">Node ID</span
              ><span class="n-form-item-label__asterisk">&nbsp;*</span></label
            >
            <n-button quaternary type="primary" @click.stop.prevent="onPressNodes"> From history </n-button>
          </div>
          <n-input v-model:value="formData.peerId" @keydown.enter.prevent />
        </div>
      </n-form-item>

      <n-form-item path="privateKey" label="Private Key (Test)" :show-label="false" style="margin-bottom: 16px">
        <div style="width: 100%">
          <div class="n-form-item-label" style="align-items: center; justify-content: space-between">
            <label class="n-form-item-label--right-mark"
              ><span class="n-form-item-label__text">Private Key (Test)</span
              ><span class="n-form-item-label__asterisk">&nbsp;*</span></label
            >
            <n-button quaternary type="primary" @click.stop.prevent="onPressGeneratePrivateKey">
              Generate a new private key for test
            </n-button>
          </div>
          <n-input v-model:value="formData.privateKey" @keydown.enter.prevent @blur="onBlurPrivateKey" />
        </div>
      </n-form-item>
      <n-form-item path="publicKey" label="Public Key (Address)" style="margin-bottom: 16px">
        <n-input v-model:value="formData.publicKey" disabled @keydown.enter.prevent />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="setting-footer">
        <n-button class="setting-footer-btn" @click="onPressCancel">Cancel</n-button>
        <n-button class="setting-footer-btn" type="primary" @click="onPressSubmit">Submit</n-button>
      </div>
    </template>
    <n-modal v-model:show="isVisibleNodeList" :mask-closable="false">
      <HistoryNodes @selected="onNodeListSelected" @cancel="onNodeListCancel" />
    </n-modal>
  </n-card>
</template>
<script lang="ts">
import { genPrivateKey, addressWith } from '@edgematrixjs/util';
import { ref, defineComponent, defineProps, h, computed } from 'vue';
import {
  NForm,
  NFormItem,
  NButton,
  NInput,
  NSelect,
  NMenu,
  NCard,
  NTag,
  NModal,
  FormInst,
  FormRules,
  useMessage,
} from 'naive-ui';
import HistoryNodes from '@/components/history-nodes.vue';
export default defineComponent({
  components: { NForm, NFormItem, NButton, NMenu, NInput, NSelect, NCard, NTag, NModal, HistoryNodes },
  props: {
    network: { type: String, default: '' },
    privateKey: { type: String, default: '' },
    publicKey: { type: String, default: '' },
    peerId: { type: String, default: '' },
  },
  emits: ['cancel', 'submit'],
  setup(props, ctx) {
    const formRef = ref<FormInst | null>(null);
    const formData = ref<GlobalSetting>({
      network: props.network,
      privateKey: props.privateKey,
      publicKey: props.publicKey,
      peerId: props.peerId,
    });

    const formRule: FormRules = {
      network: [
        {
          required: true,
          message: "Can't be empty",
          trigger: ['input', 'blur'],
        },
      ],
      privateKey: [
        {
          required: true,
          message: "Can't be empty",
          trigger: ['input', 'blur'],
        },
      ],
      publicKey: [
        {
          required: true,
          message: "Can't be empty",
          trigger: ['input', 'blur'],
        },
      ],
      peerId: [
        {
          required: true,
          message: "Can't be empty",
          trigger: ['input', 'blur'],
        },
      ],
    };

    const publicKeyWith = (privateKey: string): string => {
      try {
        return addressWith(privateKey);
      } catch (e) {
        return '';
      }
    };

    const isVisibleNodeList = ref(false);

    return {
      formRef,
      formData,
      formRule,
      isVisibleNodeList,
      onBlurPrivateKey() {
        console.info(formData.value.privateKey);
        if (formData.value.privateKey) {
          formData.value.publicKey = publicKeyWith(formData.value.privateKey);
        } else {
          formData.value.publicKey = '';
        }
      },
      onPressNodes() {
        isVisibleNodeList.value = true;
      },
      onNodeListSelected(item: HistoryNode) {
        formData.value.peerId = item.value;
        isVisibleNodeList.value = false;
      },
      onNodeListCancel() {
        isVisibleNodeList.value = false;
      },
      onPressCancel() {
        ctx.emit('cancel');
      },
      async onPressSubmit() {
        try {
          await formRef.value?.validate();
          let network = formData.value.network;
          let privateKey = formData.value.privateKey;
          let publicKey = formData.value.publicKey;
          let peerId = formData.value.peerId;
          ctx.emit('submit', {
            network,
            privateKey,
            publicKey,
            peerId,
          });
        } catch (errors) {
          console.info(errors);
        }
      },
      onPressGeneratePrivateKey: () => {
        formData.value.privateKey = genPrivateKey();
        formData.value.publicKey = publicKeyWith(formData.value.privateKey);
      },
    };
  },
});
</script>
<style scoped>
.setting-item-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.setting-item:not(:last-child) {
  margin-bottom: 16px;
}

.setting-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.setting-footer-btn:not(:last-child) {
  margin-right: 16px;
}
</style>
