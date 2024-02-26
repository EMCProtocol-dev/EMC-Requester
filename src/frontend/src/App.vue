<template>
  <n-layout has-sider position="absolute">
    <n-layout-sider :width="400" content-style="padding: 24px;">
      <Sider />
    </n-layout-sider>
    <n-layout>
      <n-layout-content content-style="padding: 24px;">
        <template v-if="ready">
          <router-view />
        </template>
        <template v-else>
          <div class="loading">
            <n-spin size="large" />
          </div>
        </template>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import {
  useLoadingBar,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NSpin,
} from "naive-ui";
import { loadingBarApiRef } from "./routes/index";
import { useIsMobile } from "./tools/composables";
import Sider from "@/layout/app/sider";
import { useSettingStore, useSiderStore, useIDLStore } from "./stores/app";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  name: "App",
  components: { NLayout, NLayoutSider, NLayoutContent, Sider, NSpin },
  setup() {
    const ready = ref(false);
    const loadingBar = useLoadingBar();
    //is mobile
    const isMobileRef = useIsMobile();

    const router = useRouter();
    const route = useRoute();

    const settintStore = useSettingStore();
    const idlStore = useIDLStore();
    const siderStore = useSiderStore();

    onMounted(async () => {
      const setting = settintStore.initSetting();
      if (setting) {
        const idl = await idlStore.initIDL(setting);
        const menus = siderStore.initMenus(idl);
        if (route.query.nodeId) {
          settintStore.setSetting({ ...setting, peerId: route.query.nodeId });
        }
      } else {
        router.replace({ name: "home" });
      }
      loadingBarApiRef.value = loadingBar;
      loadingBar.finish();
      ready.value = true;
    });
    return {
      ready,
      isMobile: isMobileRef,
    };
  },
});
</script>
<style scoped>
.loading {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
