import { shallowMount, createLocalVue } from '@vue/test-utils';

import BH from 'bh';
import BhText from 'bh/components/BhText';


const localVue = createLocalVue();
localVue.use(BH);

const formmater1 = v => v.replace(' ', '_');

describe('BhText.vue', () => {
  describe('without initial formatters', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(BhText, {
        localVue,
      });
    });

    test('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });

    describe('with formatters', () => {
      beforeEach(() => {
        wrapper.setProps({
          formatters: [
            formmater1,
          ],
        });
      });

      describe('value is "ok ok"', () => {
        beforeEach(() => {
          wrapper.setProps({
            value: 'ok ok',
          });
        });

        test('value is formatted to "ok_ok"', () => {
          const emitted = wrapper.emitted('input');
          expect(emitted).toBeDefined();
          expect(emitted[0][0]).toBe('ok_ok');
        });
      });
    });

    describe('value is "ok ok"', () => {
      beforeEach(() => {
        wrapper.setProps({
          value: 'ok ok',
        });
      });

      describe('add formatters', () => {
        beforeEach(() => {
          wrapper.setProps({
            formatters: [
              formmater1,
            ],
          });
        });

        test('value is formatted to "ok_ok"', () => {
          const emitted = wrapper.emitted('input');
          expect(emitted).toBeDefined();
          expect(emitted[emitted.length - 1][0]).toBe('ok_ok');
        });
      });
    });
  });

  describe('with initial formatters', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(BhText, {
        localVue,
        propsData: {
          formatters: [
            formmater1,
          ],
        },
      });

      describe('value is "ok ok"', () => {
        beforeEach(() => {
          wrapper.setProps({
            value: 'ok ok',
          });
        });

        test('value is formatted to "ok_ok"', () => {
          const emitted = wrapper.emitted('input');
          expect(emitted).toBeDefined();
          expect(emitted[0][0]).toBe('ok_ok');
        });
      });
    });
  });
});