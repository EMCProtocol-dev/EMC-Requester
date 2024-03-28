<template>
  <div>
    <!-- <template v-for="(key, profile) in schema">
      <template v-if="profile.type === 'object'">
        <JsonSchemaViewerObject :schema="profile" />
      </template>
    </template> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'JsonSchemaViewerObject',
});
</script>
<script lang="ts" setup>
import { ref, watch } from 'vue';
const props = defineProps({
  data: { type: Object, default: () => ({}) },
  schema: { type: Object, default: () => ({}) },
});
// const list = ref<string[]>([]);

// watch(()=>props.data,(val)=>{},{immediate:true});
</script>
