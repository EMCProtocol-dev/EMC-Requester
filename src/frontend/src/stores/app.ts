import { ref, h } from 'vue';
import { defineStore } from 'pinia';
import { NTag, useNotification } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { RouterLink } from 'vue-router';
import Utils from '@/tools/utils';
import { sendTelegram } from '@/tools/send';
import { genPrivateKey, addressWith } from '@edgematrixjs/util';
import { Http } from '@/tools/http';
export const useSettingStore = defineStore('setting', () => {
  const network = ref('');
  const privateKey = ref('');
  const publicKey = ref('');
  const peerId = ref();
  const nodeList = ref<Array<HistoryNode>>([]);
  return {
    network,
    privateKey,
    publicKey,
    peerId,
    nodeList,
    setSetting(params: GlobalSetting) {
      network.value = params.network;
      privateKey.value = params.privateKey;
      publicKey.value = params.publicKey;
      peerId.value = params.peerId;
      Utils.setLocalStorage('emc.global-setting', params);
      this.addNodeIfNeed({ label: params.peerId, value: params.peerId });
    },
    addNodeIfNeed(item: HistoryNode) {
      const index = nodeList.value.findIndex((i) => i.value === item.value);
      if (index === -1) {
        nodeList.value.push(item);
      }
      Utils.setLocalStorage('emc.global-node-list', nodeList.value);
    },
    removeNode(item: HistoryNode) {
      const index = nodeList.value.findIndex((i) => i.value === item.value);
      if (index > -1) {
        nodeList.value.splice(index, 1);
      }
      Utils.setLocalStorage('emc.global-node-list', nodeList.value);
    },
    initSetting() {
      //0x052f333aa44ebf63bdfd126b4b4d74ca36906f6dc0db65fe59551ab0dd7c7976
      //0xd8412964623645021b1fc8dc60961468192c771a
      const localGlobalSetting = Utils.getLocalStorage('emc.global-setting');
      if (!localGlobalSetting || !localGlobalSetting.privateKey) {
        const privateKey = genPrivateKey();
        const defaultSetting = {
          network: 'https://oregon.edgematrix.xyz',
          privateKey: privateKey,
          publicKey: addressWith(privateKey),
          peerId: '16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5',
        };
        Utils.setLocalStorage('emc.global-setting', defaultSetting);
      }
      const globalSetting: GlobalSetting = Utils.getLocalStorage('emc.global-setting');

      if (typeof globalSetting === 'object' && globalSetting !== null) {
        network.value = globalSetting.network;
        privateKey.value = globalSetting.privateKey;
        publicKey.value = globalSetting.publicKey;
        peerId.value = globalSetting.peerId;
      }

      const localNodeList = Utils.getLocalStorage('emc.global-node-list');

      if (!Array.isArray(localNodeList) || localNodeList.length === 0) {
        const defaultNodeList = [
          {
            value: '16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5',
            label: '16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5',
          },
        ];
        Utils.setLocalStorage('emc.global-node-list', defaultNodeList);
      }

      const globalNodeList = Utils.getLocalStorage('emc.global-node-list');

      nodeList.value = globalNodeList;

      return globalSetting;
    },
  };
});

interface MenuItemRouterLink {
  key: string;
  label: string;
  to?: any;
}

export const useSiderStore = defineStore('sider', () => {
  const menus = ref<Array<any>>([]);
  const siderMenus = ref<Array<any>>([]);

  function renderMenuItemText(type: any, content: any) {
    return h(NTag, { bordered: false, type }, { default: () => h('h4', {}, content) });
  }

  function renderMenuItemLink({ label, to, key }: MenuItemRouterLink): MenuOption {
    return {
      key: key,
      label: () => h(RouterLink, { to }, { default: () => renderMenuItemText('success', `Entry Point ${label}`) }),
    };
  }

  return {
    menus,
    siderMenus,
    initMenus(idl: Array<any>) {
      const apiMenus: Array<any> = [];
      idl.forEach((item) => {
        apiMenus.push({
          label: item.path,
          key: `/api/${item._key}`,
          desc: '',
          to: { name: 'api', params: { key: item._key } },
        });
      });
      const _menus: Array<any> = [
        { label: 'Info', key: '/info', desc: 'the node info', to: { name: 'info' } },
        { label: 'Echo', key: '/echo', desc: 'test something', to: { name: 'echo' } },
        { label: 'IDL', key: '/idl', desc: 'query api list', to: { name: 'idl' } },
        {
          label: 'Legacy-APIs',
          key: 'legacy-api',
          desc: 'legacy api list',
          children: [{ label: '*', key: '/legacy-api/*', desc: '', to: { name: 'legacy-api', params: { key: '*' } } }],
        },
        { label: 'APIs', key: 'api', desc: 'api list', children: apiMenus },
      ];
      menus.value = _menus;
      const _siderMenus: MenuOption[] = [];
      _menus.forEach((item: any, index: number) => {
        if (typeof item.to === 'object') {
          _siderMenus.push(renderMenuItemLink({ label: item.label, to: item.to, key: item.key }));
        } else if (Array.isArray(item.children)) {
          const name = item.label;
          const menuChildren: MenuOption[] = [];
          item.children.forEach((item: any, index: number) => {
            if (typeof item.to === 'object') {
              menuChildren.push(renderMenuItemLink({ label: `${name} - ${item.label}`, to: item.to, key: item.key }));
            }
          });
          _siderMenus.push({
            label: () => renderMenuItemText('info', `Entry Point ${item.label}`),
            key: item.key,
            children: menuChildren,
          });
        }
        _siderMenus.push({
          key: `divider-${index}`,
          type: 'divider',
          props: { style: { marginLeft: '16px' } },
        });
      });
      siderMenus.value = _siderMenus;

      return _menus;
    },
  };
});

export const useIDLStore = defineStore('idl', () => {
  const idl = ref<Array<IDL>>([]);
  const settingStore = useSettingStore();
  const notification = useNotification();

  async function queryPortsWithPeerId(peerId: string) {
    const http = Http.getInstance();
    const response = await http.get({
      url: 'https://cloud.emchub.ai/emc-boot/node/emcNode/queryNodeByName',
      data: { name: peerId },
    });
    const result = Utils.parseJSON(response?.data?.result || '{}') || {};
    if (!result) {
      notification.error({ title: 'ERROR', content: 'The "ports" is empty.' });
    }
    if (!Array.isArray(result.detail)) {
      return { map: {}, list: [] };
    }
    const list = result.detail as any[];
    const map: { [appOrigin: string]: any } = {};
    list.forEach((item) => {
      map[item.appOrigin] = item;
    });
    return { map, list };
  }

  // query interface list from cloud
  async function queryIDLFromCloud(appOrigin: string) {
    if (!appOrigin) {
      notification.error({ title: 'ERROR', content: 'Query "IDL" failed.\nBecause "appOrigin" is empty.' });
      return [];
    }
    const http = Http.getInstance();
    const response = await http.get({
      url: 'https://cloud.emchub.ai/emcboot/model/emcAiModel/queryIdlByAppOrigin',
      data: { appOrigin: appOrigin },
    });
    if (!response?.data?.result) {
      notification.error({ title: 'ERROR', content: 'The "IDL" is empty.' });
    }

    const result = Utils.parseJSON(response?.data?.result || '[]') || [];
    if (!Array.isArray(result)) {
      return [];
    }
    return result as any[];
  }
  return {
    idl,
    async initIDL(params = { network: '', peerId: '', privateKey: '' }) {
      const network = params.network || settingStore.network;
      const peerId = params.peerId || settingStore.peerId;
      const privateKey = params.privateKey || settingStore.privateKey;
      if (!network) {
        //error
      }
      if (!peerId) {
        //error
      }
      if (!privateKey) {
        //error
      }

      const { map: portMap, list: portList } = await queryPortsWithPeerId(peerId);

      //call /info
      const { _result, _desc, response = {} } = await sendTelegram({ network, peerId, privateKey, endpoint: '/info' });
      const teleRespDataFormatted = Utils.responseFormatted(response?.data || {});
      const tag = teleRespDataFormatted?.result?.response?.tag || '';
      const gpuInfo = Utils.parseJSON(teleRespDataFormatted?.result?.response?.gpu_info) || { gpus: 0, graphics_card: [] };
      const appInfo = Utils.parseJSON(tag) || { appOrigin: tag, gpuInfo: gpuInfo.graphics_card };
      const appOrigins = appInfo.appOrigin?.split(',') || [];
      const promises = appOrigins.map((appOrigin: string) => queryIDLFromCloud(appOrigin));
      const idlSection = await Promise.all(promises);

      let _idl: any[] = [
        {
          _key: '*',
          path: '*',
          method: '*',
          port: '*',
          desc: 'Custom Api',
          owner: '*',
          contentType: 'application/json',
          rawExample: '',
          rawDesc: 'Enter you inside api body anything',
        },
      ];
      idlSection.forEach((idl, index) => {
        const appOrigin = appOrigins[index];
        idl.forEach((item: IDL) => {
          item._key = window.encodeURIComponent(window.btoa(item.path.replaceAll('/', '')).replaceAll('=', ''));
          item.port = portMap[appOrigin].port || 0;
          _idl.push(item);
        });
      });

      idl.value = _idl;
      return _idl;
    },
    //backup
    async initIDL2(params = { network: '', peerId: '', privateKey: '' }) {
      const network = params.network || settingStore.network;
      const peerId = params.peerId || settingStore.peerId;
      const privateKey = params.privateKey || settingStore.privateKey;
      if (!network) {
        //error
      }
      if (!peerId) {
        //error
      }
      if (!privateKey) {
        //error
      }
      const {
        _result,
        _desc,
        response = {},
      } = await sendTelegram({
        network,
        peerId,
        privateKey,
        endpoint: '/idl',
      });
      const responseDataFormatted = Utils.responseFormatted({ ...response.data });
      const { response: insideResponse } = responseDataFormatted.result || {};
      let _idl = insideResponse || [];
      //cover {idl:[]}
      if (!Array.isArray(_idl)) {
        _idl = _idl.idl || [];
      }
      _idl.forEach((item: IDL) => {
        item._key = window.encodeURIComponent(window.btoa(item.path.replaceAll('/', '')).replaceAll('=', ''));
      });
      _idl.unshift({
        _key: '*',
        path: '*',
        method: '*',
        desc: 'Custom Api',
        owner: '*',
        contentType: 'application/json',
        rawExample: '',
        rawDesc: 'Enter you inside api body anything',
      });
      idl.value = _idl;
      return _idl;
    },
  };
});
