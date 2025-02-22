<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <section v-if="repository" class="repository-tests">
      <section class="repository-tests__description">
        <div class="repository-tests__title">
          <unnnic-card
            type="title"
            :title="$t('webapp.home.bases.tests')"
            enabled
            icon="messages-bubble-1"
            infoPosition="right"
            :hasInformationIcon="false"
            scheme="aux-lemon"
          />
          <p class="repository-tests__description__text">
            {{ $t("webapp.home.bases.tests_subtitle") }}
          </p>
        </div>
        <div class="repository-tests__select__inputs">
          <div class="repository-tests__select__input">
            <unnnicSelect v-if="bases.length" size="md" placeholder="" v-model="baseIdLang">
              <option
                v-for="base in bases"
                :value="[base.knowledge_base, base.language].join('⇝')"
                :key="base.knowledge_base"
                size="sm"
              >
                {{ base.title }}
              </option>
            </unnnicSelect>
          </div>
        </div>
      </section>
      <!-- title -->
    </section>
    <hr />
    <section>
      <div v-if="initText" id="webchat" />
      <div class="error-text" v-else>
        Não foi possível consultar a base de conhecimento. tente de novo mais tarde.
      </div>
    </section>
  </repository-view-base>
</template>
<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RepositoryBase from '../Base';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'RepositoryContentTests',
  data() {
    return {
      bases: [],
      basesText: [],
      repositoryUUID: null,
      selectedBase: null,
      textToSend: null,
      selectedBaseText: null,
      baseIdLang: ''
    };
  },
  components: {
    RepositoryViewBase
  },
  extends: RepositoryBase,
  computed: {
    ...mapGetters(['myProfile']),
    authorization() {
      return this.repository?.authorization?.uuid
        ? `Bearer ${this.repository?.authorization?.uuid}`
        : '';
    },
    initText() {
      if (this.myProfile.language && this.authorization && this.baseIdLang) {
        const infos = [this.myProfile.language, this.authorization, this.baseIdLang];
        return infos.every(info => info) ? infos.join('⇝') : '';
      }
      return null
    }
  },
  methods: {
    ...mapActions(['getQATexts'])
  },
  watch: {
    // eslint-disable-next-line
    "repository.uuid"() {
      if (!this.repository.uuid || this.repository.uuid === 'null') {
        return false;
      }
      this.repositoryUUID = this.repository.uuid;
    },
    // eslint-disable-next-line
    myProfile() {
      if (this.myProfile.language === null) {
        this.myProfile.language = 'en-us';
        return true;
      }
    },
    async repositoryUUID() {
      const response = await this.getQATexts({
        repositoryUUID: this.repositoryUUID,
        knowledgeBaseId: this.$route.params.id,
        page: 0
      });

      this.baseIdLang = `${String(response.data.results?.[0]?.knowledge_base)}⇝${String(
        response.data.results?.[0]?.language
      )}`;

      response.data.results.forEach(({ knowledge_base, title, language }) => {
        this.bases.push({
          knowledge_base,
          title,
          language
        });
      });
    },
    initText() {
      if (!this.initText) {
        return false;
      }
      const message = this.initText;
      if (window.WebChat) {
        window.WebChat.send(message);
      } else {
        const script = document.createElement('script');
        const flowsUUID = runtimeVariables.get('VUE_APP_QA_FLOW_CHANNEL');
        script.setAttribute('src', 'https://storage.googleapis.com/push-webchat/wwc-latest.js');
        script.setAttribute('id', 'removeScript');
        document.body.appendChild(script);
        script.addEventListener('load', () => {
          window.WebChat.default.init({
            selector: '#webchat',
            // initPayload: message,
            channelUuid: flowsUUID,
            host: 'https://new.push.al',
            socketUrl: 'https://websocket.weni.ai',
            sessionId: `${Math.floor(Math.random() * 1e10).toString(36)
              + new Date().getTime().toString(36)}`,
            title: 'Title',
            subtitle: 'Subtitle',
            startFullScreen: false,
            inputTextFieldHint: this.$t('webapp.home.bases.tests_placeholder'),
            customizeWidget: {
              userMessageBubbleColor: '#edfffe',
              userMessageTextColor: '#272B33',
              fullScreenBotMessageBubbleColor: '$unnnic-color-neutral-light',
              botMessageBubbleColor: '#272B33',
              inputBackgroundColor: '#FFFFFF',
              inputFontColor: '#4E5666',
              inputPlaceholderColor: '#67738B'
            }
          });
          window.WebChat.open();
          setTimeout(() => window.WebChat.send(message), 1000);
        });
      }
      return true;
    }
  },
  beforeMount() {
    window.WebChat = null;
  },
  beforeDestroy() {
    const script = document.querySelector('#removeScript');

    if (script) {
      script.parentNode.removeChild(script);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.repository-tests {

  &__description {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__text {
      margin-top: $unnnic-inset-nano;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-dark;
      margin-right: 1rem;
    }
  }
  &__select {
    &__input {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  /deep/ .input.size-md {
    height: 46px;
  }
}

#webchat {
  ::v-deep {
    // container principal
    .push-widget-container {
      position: unset;
      width: 100%;
      height: 430px;
      box-shadow: none;

      @media (min-width: 1440px) {
        height: 700px;
      }
    }
    .push-poweredby-container {
      display: none;
    }
    .push-launcher {
      display: none;
    }
    .push-header.push-with-subtitle {
      display: none;
    }
    .push-conversation-container {
      box-shadow: none;
    }
    // area de pergunta
    .push-sender {
      background-color: #fff !important;
      padding: 16px;
      height: unset;

      input {
        border: solid $unnnic-color-neutral-clean 1px;
        border-radius: $unnnic-border-radius-sm;
        padding: $unnnic-squish-xs;
        height: 46px;
        margin-right: $unnnic-inset-sm;
      }
      .push-send {
        background-color: transparent !important;
      }
    }
    // caixa de resposta
    .push-response {
      padding: 20px;
      border-radius: 4px 32px 32px 32px;
      border: 1px solid $unnnic-color-neutral-soft;
      max-width: 50%;
      &:hover {
        background-color: $unnnic-color-background-grass;
      }
    }
    // texto da resposta
    .push-markdown {
      h2 {
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-darkest;
      }
      h4 {
        strong {
          font-family: $unnnic-font-family-secondary;
          white-space: pre;
          font-weight: $unnnic-font-weight-bold;
          font-size: $unnnic-font-size-body-gt;
          color: $unnnic-color-brand-weni-soft !important;
          margin-block-start: 0px;
          margin-block-end: 0px;
        }
      }
      ul {
        list-style-type: disc;
        padding-inline-start: 40px;
      }
    }
    // pergunta
    .push-client {
      border: 1px solid #009e963d;
      border-radius: 32px 4px 32px 32px;
      padding: 24px 32px 24px 24px;
      // texto da pergunta
      &:before {
        content: "Sua pergunta\a";
        font-family: $unnnic-font-family-secondary;
        white-space: pre;
        font-weight: $unnnic-font-weight-bold;
        font-size: $unnnic-font-size-body-gt;
        color: #009e96;
        padding-bottom: $unnnic-inset-nano;
      }
      &:hover {
        background-color: #e1fffd;
      }
    }
    //clipe
    label[for="push-file-upload"] {
      display: none;
    }
    // botao de perguntar
    .push-send {
      border: dashed $unnnic-color-neutral-clean 1px;
      padding: 0.75rem;
      border-radius: $unnnic-border-radius-sm;
      width: 45px;
      img {
        display: none;
      }
      &:after {
        background-image: url("~@/assets/imgs/send.svg");
        background-repeat: no-repeat;
        background-position: center;
        background-position-x: left;
        padding: 0.75rem;
        content: " ";
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-lg;
        color: #4e5666;
      }
      &:hover {
        border: 1px solid $unnnic-color-neutral-clean;
      }
    }
    // texto da pergunta
    .push-message-text {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
    }
    .push-message {
      margin-bottom: 1rem;
    }

    .push-full-screen .push-conversation-container .push-new-message {
      height: 48px;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      text-shadow: none;
      border-radius: $unnnic-border-radius-sm;
      padding: $unnnic-squish-xs;
      border: 1px solid $unnnic-color-neutral-soft;
      line-height: 22px;
      color: #4e5666;
      margin-right: $unnnic-inset-sm;
    }

    .push-full-screen .push-conversation-container .push-new-message:focus {
      border: 1px solid #9caccc;
      caret-color: #9caccc;
    }

    .push-full-screen
      .push-conversation-container
      .push-new-message:focus::-webkit-input-placeholder {
      /* Chrome/Opera/Safari */
      color: $unnnic-color-neutral-clean;
    }

    .push-full-screen .push-conversation-container .push-new-message:focus::-moz-placeholder {
      /* Firefox 19+ */
      color: $unnnic-color-neutral-clean;
    }

    .push-full-screen .push-conversation-container .push-new-message:focus:-ms-input-placeholder {
      /* IE 10+ */
      color: $unnnic-color-neutral-clean;
    }

    .push-full-screen .push-conversation-container .push-new-message:focus:-moz-placeholder {
      /* Firefox 18- */
      color: $unnnic-color-neutral-clean;
    }
    .push-full-screen .push-conversation-container .push-sender {
      background-color: $unnnic-color-neutral-light;
      border-top: 1px solid $unnnic-color-neutral-soft;
    }

    .push-full-screen .push-messages-container {
      padding: $unnnic-inset-md;
    }

    .push-full-screen .push-messages-container .push-message .push-response {
      border: 1px solid $unnnic-color-neutral-soft;
      border-radius: 4px 32px 32px 32px;
      padding: 24px 80px 24px 24px;
      color: $unnnic-color-neutral-darkest;
      max-width: 50%;
    }
    .push-response {
      background-color: $unnnic-color-neutral-light;
    }
    .push-full-screen .push-messages-container .push-message .push-response:hover {
      background: #f5f6f6;
    }

    .push-full-screen .push-messages-container .push-message .push-client {
      border: 1px solid #c2e8e6;
      border-radius: 32px 4px 32px 32px;
      padding: 24px 64px 24px 24px;
      max-width: 35%;
    }

    .push-full-screen .push-messages-container .push-message .push-client:hover {
      background: #e1fffd;
    }

    .push-markdown h2 {
      margin-block-start: $unnnic-inset-nano;
      margin-block-end: 4px;
      font-size: 18px;
    }
  }
}

/deep/ .icon-right {
  transform: translateY(100%);
}

.error-text {
  font-family: $unnnic-font-family-secondary;
}
</style>
