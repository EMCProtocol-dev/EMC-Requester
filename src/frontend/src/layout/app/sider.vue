<template>
  <template v-if="loading">
    <div class="sider-loading">
      <n-spin size="large" />
    </div>
  </template>
  <div class="global-card">
    <n-card>
      <template #header>
        <img class="logo" />
      </template>
      <template #header-extra>
        <n-button strong secondary circle type="default" :disabled="loading" @click="onPressSetting">
          <template #icon>
            <n-icon size="20">
              <SettingIcon />
            </n-icon>
          </template>
        </n-button>
      </template>
      <div class="global-info">
        <div class="global-info-item">
          <div class="global-info-item-label">Network</div>
          <div class="global-info-item-content">{{ network }}</div>
        </div>
        <div class="global-info-item">
          <div class="global-info-item-label">Private Key</div>
          <div class="global-info-item-content">{{ privateKey }}</div>
        </div>
        <div class="global-info-item">
          <div class="global-info-item-label">Public Key (Address)</div>
          <div class="global-info-item-content">{{ publicKey }}</div>
        </div>
        <div class="global-info-item">
          <div class="global-info-item-label">Node ID</div>
          <div class="global-info-item-content">{{ peerId }}</div>
        </div>
      </div>
    </n-card>
  </div>
  <n-menu
    :value="currentMenu"
    :default-expand-all="true"
    :options="siderMenus"
    :indent="16"
    :accordion="true"
    :watch-props="['defaultExpandedKeys']"
    @update:value="handleUpdateValue"
  />
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
import { ref, defineComponent, h, computed, nextTick, watch } from 'vue';
import { NButton, NSpin, NIcon, NMenu, NCard, NTag, NModal, useMessage } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { Settings as SettingIcon } from '@vicons/ionicons5';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useSettingStore, useSiderStore, useIDLStore } from '@/stores/app';
import GlobalSetting from '@/components/global-setting.vue';

export default defineComponent({
  components: { NButton, NSpin, NMenu, NIcon, NCard, NTag, NModal, SettingIcon, GlobalSetting },
  setup() {
    const message = useMessage();
    const siderStore = useSiderStore();
    const siderMenus = computed(() => siderStore.siderMenus);
    const currentMenu = ref('');

    const loading = ref(false);
    const settingStore = useSettingStore();
    const network = computed(() => settingStore.network);
    const privateKey = computed(() => settingStore.privateKey);
    const publicKey = computed(() => settingStore.publicKey);
    const peerId = computed(() => settingStore.peerId);

    const idlStore = useIDLStore();
    const isVisibleGlobalSetting = ref(false);
    const router = useRouter();
    const route = useRoute();

    watch(
      () => route.path,
      (path, oldVal) => {
        currentMenu.value = path;
      },
      { immediate: true }
    );

    return {
      currentMenu,
      siderMenus,
      loading,
      network,
      privateKey,
      publicKey,
      peerId,
      isVisibleGlobalSetting,
      onPressSetting() {
        isVisibleGlobalSetting.value = true;
      },
      async onGlobalSettingSubmit(data: any) {
        isVisibleGlobalSetting.value = false;
        loading.value = true;
        const idl = await idlStore.initIDL(data);
        const menus = await siderStore.initMenus(idl);
        settingStore.setSetting(data);
        loading.value = false;
        router.push({ name: 'info' });
      },
      onGlobalSettingCancel() {
        isVisibleGlobalSetting.value = false;
      },
      handleUpdateValue(key: string, item: MenuOption) {
        // console.info(key);
        // message.info('[onUpdate:value]: ' + JSON.stringify(key));
        // message.info('[onUpdate:value]: ' + JSON.stringify(item));
      },
    };
  },
});
</script>
<style scoped>
.sider-loading {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
}
.logo {
  content: url('@/assets/logo.png');
  width: 120px;
}
.global-card {
  padding: 8px;
}
/* .global-info {
}
.global-info-item {
} */
.global-info-item:not(:last-child) {
  margin-bottom: 4px;
}
.global-info-item-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}
.global-info-item-content {
  font-size: 14px;
  font-weight: bold;
}

@media (prefers-color-scheme: light) {
  .logo {
    content: url('@/assets/logo.light.png');
  }
  .global-info-item-label {
    color: rgba(0, 0, 0, 0.3);
  }
}
</style>
