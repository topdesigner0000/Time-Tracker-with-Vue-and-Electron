import { Store } from 'vuex-mock-store';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Index from '@/pages/index';

describe('Index', () => {
  let wrapper;

  const localVue = createLocalVue();
  localVue.directive('tooltip', () => {});

  const $store = new Store({
    getters: {
      'activities/workings': [
        {
          id: 1,
          project: { id: 2 },
          description: 'Review',
          startedAt: '2019-01-01T01:23:45'
        }
      ],
      'auth/webUrl': 'http://app.oc.plus'
    }
  });

  const $electron = {
    ipcRenderer: {
      send: jest.fn()
    },
    remote: {
      app: {
        relaunch: jest.fn(),
        exit: jest.fn(),
        quit: jest.fn()
      }
    },
    shell: {
      openExternal: jest.fn()
    }
  };

  const factory = () =>
    shallowMount(Index, {
      localVue,
      mocks: {
        $store,
        $electron
      }
    });

  describe('when click web-button', () => {
    beforeEach(() => {
      wrapper = factory();
      wrapper.find('.web-button').vm.$emit('click');
    });

    it('show browser', () => {
      expect($electron.shell.openExternal).toHaveBeenCalledWith(
        'http://app.oc.plus'
      );
    });
  });

  describe('when click settings-button', () => {
    beforeEach(() => {
      wrapper = factory();
      wrapper.find('.settings-button').vm.$emit('click');
    });

    it('show settings', () => {
      expect($electron.ipcRenderer.send).toHaveBeenCalledWith('showSettings');
    });
  });

  describe('when call logout', () => {
    beforeEach(() => {
      wrapper = factory();
      wrapper.vm.logout();
    });

    it('dispatch auth/logout', () => {
      expect($store.dispatch).toHaveBeenCalledWith('auth/logout');
    });

    it('send logout', () => {
      expect($electron.ipcRenderer.send).toHaveBeenCalledWith('logout');
    });

    it('relaunch app', () => {
      expect($electron.remote.app.relaunch).toHaveBeenCalled();
      expect($electron.remote.app.exit).toHaveBeenCalledWith(0);
    });
  });

  describe('when click quit-button', () => {
    beforeEach(() => {
      global.confirm = () => true;
      wrapper = factory();
      wrapper.find('.quit-button').vm.$emit('click');
    });

    it('quit app', () => {
      expect($electron.remote.app.quit).toHaveBeenCalled();
    });
  });
});
