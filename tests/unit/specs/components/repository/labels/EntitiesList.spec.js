import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import EntitiesList from '@/components/repository/EntitiesList';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);

describe('EntitiesList.vue', () => {
  let wrapper;
  let store;
  let getters;
  beforeEach(() => {
    const entity = 'health';
    getters = {
      getCurrentRepository: () => ({
        groups: [
          { entities: ['green_robot'] },
        ],
      }),
    };
    store = new Vuex.Store({
      modules: {
        Repository: {
          getters,
        },
      },
    });
    wrapper = shallowMount(EntitiesList, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
        $tc: () => 'some specific text',
        $route: {
          params: { entity },
        },
      },
      propsData: {
        entitiesList: {
          total: 10,
        },
        entityName: 'health',
        repository: {
          other_group: {
            entities: ['robot', 'greenRobot'],
          },
          groups: {
            entities: ['robot', 'greenRobot'],
          },
        },
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('click on edit button', () => {
    beforeEach(() => {
      const entity = 'health';
      wrapper = shallowMount(EntitiesList, {
        localVue,
        store,
        mocks: {
          $t: () => 'some specific text',
          $tc: () => 'some specific text',
          $route: {
            params: { entity },
          },
        },
        propsData: {
          entitiesList: {
            total: 10,
          },
          entityName: 'health',
          repository: {
            other_group: {
              entities: ['robot', 'greenRobot'],
            },
            groups: {
              entities: ['robot', 'greenRobot'],
            },
          },
        },
      });
      const editEntityEvent = wrapper.findComponent({ ref: 'editEntityEvent' });
      editEntityEvent.trigger('click');
      console.log(editEntityEvent);
    });
    test('expanded should be truth', () => {
      console.log(wrapper.vm.editSentences);
      expect(wrapper.vm.editSentences).toBeTruthy();
    });

    test('Entity should be de defined', () => {
      expect(wrapper.vm.entityName).toBeDefined();
    });

    test('total of sentences should be greater than 0', () => {
      expect(wrapper.vm.entitiesList.total).toBeGreaterThan(0);
    });
  });
});
