<template>
  <n-card title="History nodes" style="width: 560px" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <template v-if="nodeList.length === 0"> No historical data </template>
    <template v-else>
      <n-list bordered clickable hoverable show-divider>
        <template v-for="item in nodeList">
          <n-list-item @click="onPressItem(item)">
            <template #suffix>
              <n-button quaternary circle type="error" @click.prevent.stop="onPressRemove(item)">
                <template #icon>
                  <n-icon size="14">
                    <RemoveCircleOutline />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <div style="font-size: 14px">{{ item.label }}</div>
          </n-list-item>
        </template>
      </n-list>
    </template>
    <template #footer>
      <div class="setting-footer">
        <n-button class="setting-footer-btn" @click="onPressCancel">Cancel</n-button>
      </div>
    </template>
  </n-card>
</template>
<script lang="ts">
import { ref, defineComponent, computed } from 'vue';
import { NList, NListItem, NIcon, NButton, NCard } from 'naive-ui';
import { RemoveCircleOutline } from '@vicons/ionicons5';
import { useSettingStore } from '@/stores/app';

export default defineComponent({
  components: {
    NList,
    NListItem,
    NIcon,
    NButton,
    NCard,
    RemoveCircleOutline,
  },
  emits: ['cancel', 'selected'],
  setup(props, ctx) {
    const settingStore = useSettingStore();
    const nodeList = computed(() => settingStore.nodeList);
    return {
      nodeList,
      onPressCancel() {
        ctx.emit('cancel');
      },
      onPressItem(item: HistoryNode) {
        ctx.emit('selected', item);
      },
      onPressRemove(item: HistoryNode) {
        settingStore.removeNode(item);
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
