<template>
  <div class="page">
    <div class="info">
      <template v-if="isLoading">
        <n-spin size="large" />
      </template>
      <template v-else>
        <n-h4>Please <n-button tertiary type="primary" @click="onPressSetting"> Enter </n-button> the settings.</n-h4>
      </template>
    </div>
  </div>
  <n-modal v-model:show="isVisibleGlobalSetting" :mask-closable="false">
    <GlobalSetting
      :network="network"
      :private-key="privateKey"
      :public-key="publicKey"
      :peer-id="peerId"
      @submit="onGlobalSettingSubmit"
      @cancel="onGlobalSettingCancel"
    />
  </n-modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { NH4, NTag, NSpin, NButton, NModal } from 'naive-ui';
import GlobalSetting from '@/components/global-setting.vue';
import { useSettingStore, useSiderStore, useIDLStore } from '@/stores/app';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Home',
  components: {
    NH4,
    NTag,
    NSpin,
    NButton,
    NModal,
    GlobalSetting,
  },
  setup() {
    const siderStore = useSiderStore();
    const idlStore = useIDLStore();
    const settingStore = useSettingStore();
    const router = useRouter();
    const network = settingStore.network;
    const privateKey = settingStore.privateKey;
    const publicKey = settingStore.publicKey;
    const peerId = settingStore.peerId;
    const isVisibleGlobalSetting = ref(false);
    const isLoading = ref(false);
    return {
      network,
      privateKey,
      publicKey,
      peerId,
      isVisibleGlobalSetting,
      isLoading,
      onPressSetting() {
        isVisibleGlobalSetting.value = true;
      },
      async onGlobalSettingSubmit(data: any) {
        isVisibleGlobalSetting.value = false;
        isLoading.value = true;
        const idl = await idlStore.initIDL(data);
        const menus = await siderStore.initMenus(idl);
        settingStore.setSetting(data);
        isLoading.value = false;
        router.replace({ name: 'info' });
      },
      onGlobalSettingCancel() {
        isVisibleGlobalSetting.value = false;
      },
    };
  },
});
</script>

<style scoped>
.page {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
