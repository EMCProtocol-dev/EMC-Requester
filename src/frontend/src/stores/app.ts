import { ref, h } from 'vue';
import { defineStore } from 'pinia';
import { NTag } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { RouterLink } from 'vue-router';
import Utils from '@/tools/utils';
import { sendTelegram } from '@/tools/send';
import { genPrivateKey, addressWith } from '@edgematrixjs/util';
export const useSettingStore = defineStore('setting', () => {
  const network = ref('');
  const privateKey = ref('');
  const publicKey = ref('');
  const peerId = ref();
  return {
    network,
    privateKey,
    publicKey,
    peerId,
    setSetting(params: GlobalSetting) {
      network.value = params.network;
      privateKey.value = params.privateKey;
      publicKey.value = params.publicKey;
      peerId.value = params.peerId;
      Utils.setLocalStorage('emc.global-setting', params);
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
          label: 'APIs',
          key: 'api',
          desc: 'api list',
          children: apiMenus,
        },
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
      const { _result, _desc, response } = await sendTelegram({
        network,
        peerId,
        privateKey,
        endpoint: '/idl',
      });
      const responseDataFormatted = Utils.responseFormatted({ ...response.data });
      const { response: insideResponse } = responseDataFormatted.result || {};
      let _idl = insideResponse || [];
      //cover {idl:[]}
      if (typeof _idl === 'object' && !Array.isArray(_idl)) {
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
