<template>
  <div
    id="rpstr-vw-bs"
    class="rpstr-vw-bs">
    <div
      shadow="strong"
      class="rpstr-vw-bs__wrapper">
      <quick-test
        v-if="quickTest && repository"
        :repository="repository" />
      <div
        v-if="repository && !repository.fatal && repository.name"
        class="rpstr-vw-bs__wrapper__content">
        <slot />
      </div>
    </div>
    <div
      v-if="repository && repository.fatal && errorCode"
      class="rpstr-vw-bs__error">
      <h1>{{ errorCode|errorVerbose }}</h1>
    </div>
    <div
      v-else-if="repository && repository.fatal"
      class="rpstr-vw-bs__error">
      <h1>{{ $t('webapp.layout.error_to_retrieve_bot') }}</h1>
    </div>
    <div
      v-else-if="!repository || (repository && !repository.name && repository.loading)"
      class="rpstr-vw-bs__wrapper__content">
      <slot name="loader">
        <loading/>
      </slot>
    </div>
    <request-authorization-modal
      v-if="repository"
      :open.sync="requestAuthorizationModalOpen"
      :available="!repository.available_request_authorization"
      :repository-uuid="repository.uuid"
      @requestDispatched="onAuthorizationRequested()" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RequestAuthorizationModal from '@/components/repository/RequestAuthorizationModal';
import UserAvatar from '@/components/user/UserAvatar';
import QuickTest from '@/components/quick-test/QuickTest';
import Loading from '@/components/shared/Loading';

const ERROR_VERBOSE_LOOKUP = {
  404: 'Bot not found',
};

export default {
  name: 'RepositoryViewBase',
  inject: {
    updateRepository: {
      default: null,
    },
  },
  components: {
    QuickTest,
    UserAvatar,
    RequestAuthorizationModal,
    Loading,
  },
  filters: {
    errorVerbose: code => (ERROR_VERBOSE_LOOKUP[code] || code),
  },
  props: {
    repository: {
      type: Object,
      default: null,
    },
    errorCode: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    quickTest: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      requestAuthorizationModalOpen: false,
    };
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'myProfile',
      'getRequirements',
    ]),
    currentTitle() {
      if (this.title) {
        return this.title;
      }

      if (this.repository) {
        if (this.repository.name) {
          return this.repository.name;
        }

        return `${this.repository.owner.nickname}/${this.repository.slug}`;
      }

      return undefined;
    },
    requirementsCount() {
      if (!this.getRequirements.requirements_to_train) return 0;
      return Object
        .keys(this.getRequirements.requirements_to_train)
        .reduce(
          (previous, lang) => this.getRequirements.requirements_to_train[lang].length + previous,
          0,
        );
    },
    warningsCount() {
      if (!this.getRequirements.languages_warnings) return 0;
      return Object
        .keys(this.getRequirements.languages_warnings)
        .reduce(
          (previous, lang) => this.getRequirements.languages_warnings[lang].length + previous,
          0,
        );
    },
  },
  mounted() {
    this.updateMyProfile('user');
  },
  methods: {
    ...mapActions([
      'logout',
      'updateMyProfile',
    ]),
    openMyProfile() {
      this.$router.push({ name: 'myProfile' });
    },
    openRequestAuthorizationModal() {
      this.requestAuthorizationModalOpen = true;
    },
    onAuthorizationRequested() {
      this.requestAuthorizationModalOpen = false;
      this.$buefy.toast.open({
        message: this.$t('webapp.layout.authorization_success'),
        type: 'success',
      });
      this.updateRepository(false);
    },
  },
};
</script>


<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';


  .rpstr-vw-bs {
    margin-top: 1.5rem;
    $navigation-height: 4rem;
    $medium-screen: 1035px;
    $header-height: (16rem + $navigation-height);
    $wrapper-width: 100%;
    height: 100%;

    &__status-bar {
      background-color: $color-fake-white;
      justify-content: space-between;
      flex-direction: row;
      padding: 0;

      :nth-child(3n) {
        margin-right: 8px;
      }

      @media screen and (max-width: $medium-screen) {
        justify-content: space-around;
      }

      &__icons-align {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 0;

        &--size {
          @media screen and (max-width: $medium-screen) {
            height: 1.5rem;
            width: 1.5rem;
          }
        }
      }
    }

    &__wrapper {
      &__header {
        position: relative;
        display: grid;
        grid-template-columns: 10% 1fr 10%;
        padding: 1rem 1.5rem;
        border-bottom: .120rem solid whitesmoke;

        @media screen and (max-width: $medium-screen) {
          display: none;
        }

        &__logo {
          align-self: center;
        }

        &__options {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          &__avatar {
            text-align: right;
            cursor: auto;
            border: .120rem solid $color-primary;
            border-radius: 50%;

            @media screen and (max-width: $medium-screen) {
              display: none;
            }
          }

          &__dropdown {
            cursor: pointer;
          }
        }

        &__navigation {
          position: absolute;
          bottom: 0rem;
          left: 0;
          width: 100%;

          @media screen and (max-width: $medium-screen) {
            display: none;
          }
        }

        &__mobile-navigation {
          display: none;

          @media screen and (max-width: $mobile-width) {
            display: block;
          }
        }

        @media screen and (max-width: $mobile-width) {
          min-height: auto;
          margin: 1rem;
        }
      }

      &__content {
        margin: 0.1rem 3rem;
      }

      @media screen and (max-width: $wrapper-width) {
        border-radius: 0;
      }
    }

    &__error,
    &__loading {
      margin-top: 2rem;
      text-align: center;
    }

    &__error {
      padding: .5rem;

      h1 {
        font-size: 3rem;
        line-height: 4rem;
        font-weight: $font-weight-bolder;
        color: black;
        opacity: .5;
      }
    }

    @media screen and (max-width: $wrapper-width) {
      margin: 1rem 0;
    }

    &__footer {
      margin-top: 60vh;
    }
  }

  .hide-mobile {
    @media screen and (max-width: 1035px) {
      display: none;
    }
  }
</style>
