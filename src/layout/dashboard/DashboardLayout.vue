<template>
  <div class="dashboard-layout">
    <div
      :class="[collapse
        ? 'dashboard-layout__main-panel'
        : 'dashboard-layout__main-panel--collapsed',
        basesNewOrBasesEdit ? 'none' : null]"
        >
          <side-bar v-if="!basesNewOrBasesEdit" @collapse="collapseHandle()" />
      <router-view />
    </div>
    <tour
      v-if="getFinalModal && getFinalMessage !== 'true'"
      :step-count="1"
      name="tutorial_button"
      />
  </div>
</template>
<script>

import SideBar from '@/components/repository/sidebar/SideBar';
import UserAvatar from '@/components/user/UserAvatar';
import CustomIcon from '@/components/shared/CustomIcon';
import { mapActions, mapGetters } from 'vuex';
import Tour from '@/components/Tour';
import Analytics from '@/utils/plugins/analytics';


export default {
  name: 'DashboardLayout',
  components: {
    SideBar,
    UserAvatar,
    CustomIcon,
    Tour,
  },
  data() {
    return {
      collapse: true,
      isLoading: false,
      isFullPage: true,
      profilyStyle: '',
      beginnerTutorialModalOpen: false,
    };
  },
  computed: {
    ...mapGetters([
      'getCurrentRepository',
      'myProfile',
      'authenticated',
      'versionEnabled',
      'getFinalModal',
      'getFinalMessage',
      'getRequirements',
    ]),
    hasLoaded() {
      if (this.getCurrentRepository.params) return true;
      return false;
    },
    warningsCount() {
      if (!this.getCurrentRepository
        || !this.getCurrentRepository.selectedRepositoryselectedRepository) return 0;
      return Object.keys(this.getRequirements.languages_warnings).length;
    },
    tutorialEnabled() {
      return runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_TUTORIAL_ENABLED');
    },
    categoryIcon() {
      if (!this.getCurrentRepository
      || !this.getCurrentRepository.categories_list
      || this.getCurrentRepository.categories_list.length < 1) return 'botinho';
      return this.getCurrentRepository.categories_list[0].icon || 'botinho';
    },

    basesNewOrBasesEdit() {
      return this.$route.name === 'repository-content-bases-new'
        || this.$route.name === 'repository-content-bases-edit'
    },
  },
  destroyed(){
    this.setRepository({})
    this.resetRepositoryVersion()
  },
  methods: {
    ...mapActions([
      'logout',
      'getFirstFiveVersions',
      'setTutorialMenuActive',
      'setRepository',
      'resetRepositoryVersion'
    ]),
    openBeginnerTutorialModal() {
      if (runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_TUTORIAL_ENABLED')) {
        this.setTutorialMenuActive();
        Analytics.send({ category: 'Tutorial', event: 'tutorial open event' });
      }
    },
    collapseHandle() {
      this.collapse = !this.collapse;
    },
    routerHandle(path) {
      this.$router.push({
        name: `${path}`,
      });
    },
    openNewRepository() {
      this.$router.push({
        name: 'new',
      });
    },
    signIn() {
      this.$router.push({
        name: 'signIn',
      });
    },
    signUp() {
      this.$router.push({
        name: 'signUp',
      });
    },
  },
};
</script>
<style lang="scss">
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

html{
  overflow-y:auto
}
.dashboard-layout {

  &__notification{
    top: 0;
    position: fixed;
    z-index: 9;
  }

  &__main-panel {
    width: calc( 100% - #{$menu-expanded-size - 30});
    position: relative;
    float: right;
    padding: 0 1rem;

    &--collapsed {
       position: relative;
       float: right;
       width: calc( 100% - #{$menu-collapsed-size - 30});
    }
  }
}
.none {
  width: 100%;
}
</style>
