<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <phrase-suggestion-loading slot="loader" />

    <div v-if="repository">
      <div v-if="authenticated">
        <loading v-if="loading" />
        <div v-else-if="repository.authorization.can_contribute" class="phrase-suggestion">
          <div v-if="pageItem === 0">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__title">
                <unnnic-card
                  type="title"
                  :title="$t('webapp.phrase-suggestion.title')"
                  :hasInformationIcon="false"
                  icon="copy-paste-1"
                  scheme="feedback-blue"
                />
              </div>

              <div class="phrase-suggestion__header__container">
                <p class="phrase-suggestion__header__subtitle">
                  {{ $t('webapp.phrase-suggestion.subtitle') }}
                </p>
              </div>
            </div>

            <div class="phrase-suggestion__cards">
              <p>
                {{ $t('webapp.phrase-suggestion.select_method') }}
              </p>
              <div class="phrase-suggestion__cards__container">
                <div class="phrase-suggestion__cards__container-card">
                  <h3>
                    {{ $t('webapp.phrase-suggestion.new_sentence') }}
                  </h3>
                  <p>
                    {{ $t('webapp.phrase-suggestion.new_sentence_info') }}
                  </p>
                  <unnnic-button @click="goToAddNewSentence" type="secondary">
                    {{ $t('webapp.phrase-suggestion.select_method_button') }}
                  </unnnic-button>
                </div>
                <div class="phrase-suggestion__cards__container-card">
                  <h3>
                    {{ $t('webapp.phrase-suggestion.existing_sentence') }}
                  </h3>
                  <p>
                    {{ $t('webapp.phrase-suggestion.select_existing') }}
                  </p>
                  <unnnic-button @click="goToAddExistingSentence" type="secondary">
                    {{ $t('webapp.phrase-suggestion.select_method_button') }}
                  </unnnic-button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pageItem === 1 && isSentenceNew">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  {{ $t('webapp.phrase-suggestion.add_new') }}
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="1" :totalProgress="4" />
              </div>
            </div>

            <hr class="divider" />

            <add-sentence-form
              :repository="repository"
              @created="updatedExampleList()"
              @onSubmit="addSentence"
            />

          </div>

          <div v-if="pageItem === 1 && !isSentenceNew">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  {{ $t('webapp.phrase-suggestion.add_existing') }}
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="1" :totalProgress="4" />
              </div>
            </div>

            <hr class="divider" />
            <div class="column is-6 p-0">
              <unnnic-select
                :label="$t('webapp.phrase-suggestion.select_intent')"
                v-model="intentSelected"
                @onChange="addIntents"
              >
                <option
                  v-for="intent in repository.intents"
                  :key="intent.id"
                  :value="intent.value"
                >
                  {{ intent.value }}
                </option>
              </unnnic-select>
            </div>

            <hr class="divider" />

            <paginated-list
              v-if="phraseList"
              :item-component="sentencesIntents"
              :list="phraseList"
              :repository="repository"
              :per-page="perPage"
              @itemDeleted="onItemDeleted()"
              @itemSave="onItemSave()"
              @onSentenceSelected="onSentenceSelected"
              :load-all="true"
            />

          </div>

          <div v-if="pageItem === 2">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  {{ $t('webapp.phrase-suggestion.select_words_title') }}
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="2" :totalProgress="4" />
              </div>
            </div>

            <hr class="divider" />

            <h4 class="mb-5">
              {{ $t('webapp.phrase-suggestion.select_words') }}
            </h4>

            <div class="phrase-suggestion__word-cards__wrapper">
              <word-card
                v-for="(word, index) in wordsList"
                :key="index"
                :text="word.word"
                :entities="word.entity"
                @onChange="updateWordsList"
              />
            </div>

            <unnnic-button
              class="button--full mt-2"
              @click="addVariations"
              type="secondary"
              :loading="loadingSelectingWords"
            >
              {{ $t('webapp.phrase-suggestion.finish_selection') }}
            </unnnic-button>

          </div>

          <div v-if="pageItem === 3">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  {{ $t('webapp.phrase-suggestion.select_variations') }}
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="3" :totalProgress="4" />
              </div>
            </div>

            <hr class="divider" />

            <h4 class="mb-5">
              {{ $t('webapp.phrase-suggestion.select_variations_info') }}
            </h4>

            <unnnic-accordion
              v-for="(variation, index) in wordVariations"
              :key="index"
              v-model="variation.isOpen"
              :title="variation.word"
              class="variation-accordion mb-5"
            >
              <span
                slot="actions"
              >
                {{ $tc('webapp.phrase-suggestion.variations_generated',
                variation.inputs.length) }} /
                {{ $tc('webapp.phrase-suggestion.variations_selected',
                variation.suggestions.length) }}
              </span>
              <div>
                <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
                  <div
                    class="is-flex mr-5 mt-4"
                    v-for="(suggestion, index) in variation.inputs"
                    :key="index"
                    @click.stop="setSuggestion(suggestion, variation)"
                  >
                    <unnnic-checkbox
                      @change="setSuggestion(suggestion, variation)"
                      v-model="suggestion.checked"
                      :textRight="suggestion.text"
                    />
                  </div>
                </div>
                <hr class="divider" />
                <div @click.stop="" class="is-flex">
                  <div class="column is-4 p-0">
                    <unnnic-input
                      placeholder="Variação"
                      :label="$t('webapp.phrase-suggestion.new_variation')"
                      v-model="variation.newVariation"
                      size="sm"
                    />
                  </div>
                    <unnnic-button
                      @click="addNewVariation(variation)"
                      :disabled="!variation.newVariation"
                      class="mt-auto ml-4 add-variation"
                      style="height: 38px"
                      size="small"
                      iconLeft="add-1"
                      type="secondary"
                    >
                      {{ $t('webapp.phrase-suggestion.add') }}
                    </unnnic-button>
                </div>
              </div>
            </unnnic-accordion>

            <unnnic-button
              class="button--full mb-5"
              @click="goToGeneratedSentences"
              type="secondary"
              :loading="loadingGenerateSentences"
            >
              {{ $t('webapp.phrase-suggestion.generate_sentences') }}
            </unnnic-button>

          </div>

          <div v-if="pageItem === 4">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  {{ $t('webapp.phrase-suggestion.generated_sentences') }}
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="4" :totalProgress="4" />
              </div>
            </div>

            <hr class="divider" />

            <div class="phrase-suggestion__cards__variation-card">
              <div>
                <h3>
                  {{ $tc('webapp.phrase-suggestion.new_sentences_generated',
                  generatedSentences.length) }}
                </h3>
                <p class="mb-0">
                  {{ $t('webapp.phrase-suggestion.generated_from_sentence') }}
                  <span>{{ sentenceSelected.text }}</span>
                  {{ $t('webapp.phrase-suggestion.to_intent') }}
                  <span>{{ intentSelected }}</span>
                </p>
              </div>
              <unnnic-button
                @click="onSubmitToTraining"
                :loading="submittingToTraining"
                type="secondary"
              >
                {{ $t('webapp.phrase-suggestion.send_to_training') }}
              </unnnic-button>
            </div>

            <generated-sentences-table
              :list="generatedSentences"
              :repository="repository"
              :per-page="perPage"
              @onDeleteSentence="deleteSentence"
              @onSaveSentence="updateGeneratedList"
              load-all
            />

          </div>

        </div>
      </div>
      <div v-else>
        <authorization-request-notification
          :available="!repository.available_request_authorization"
          :repository-uuid="repository.uuid"
          @onAuthorizationRequested="updateRepository(false)"
        />
      </div>
    </div>
    <unnnic-modal
      :showModal="openFinishModal"
      :text="$t('webapp.phrase-suggestion.sent_to_training')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      :closeIcon="false"
    >
      <span
      slot="message"
      >
        {{ $t('webapp.phrase-suggestion.sent_to_training_info') }}
      </span>
      <unnnic-button
        slot="options"
        type="secondary"
        @click="goToTraining"
      >
        {{ $t('webapp.phrase-suggestion.go_to_training') }}
      </unnnic-button>
    </unnnic-modal>
  </repository-view-base>
</template>

<script>
import RepositoryBase from './Base';
import { mapGetters, mapActions } from 'vuex';
import Loading from '@/components/shared/Loading';
import LoginForm from '@/components/auth/LoginForm';
import IntentSuggestionList from '@/components/shared/IntentSuggestionList';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import BadgesIntentsSuggestion from '@/components/repository/BadgesIntentsSuggestion';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import IntentPagination from '@/components/shared/IntentPagination';
import AddSentenceForm from '@/components/repository/phrase-suggestion/AddSentenceForm';
import WordCard from '@/components/shared/accordion/WordCard';
import GeneratedSentencesTable from '@/components/repository/GeneratedSentencesTable';
import PaginatedList from '@/components/shared/PaginatedList';
import IntentSuggestion from '@/components/shared/accordion/IntentSuggestion';
import PhraseSuggestionLoading from './PhraseSuggestionLoading';


export default {
  name: 'PhraseSuggestion',
  components: {
    Loading,
    LoginForm,
    IntentSuggestionList,
    RepositoryViewBase,
    BadgesIntentsSuggestion,
    AuthorizationRequestNotification,
    IntentPagination,
    AddSentenceForm,
    WordCard,
    GeneratedSentencesTable,
    PaginatedList,
    PhraseSuggestionLoading,
  },
  extends: RepositoryBase,
  data() {
    return {
      pageItem: 0,
      isSentenceNew: false,
      perPage: 300,
      loading: false,
      intentSelected: '',
      phraseList: {
        items: [],
        total: 0,
      },
      sentenceSelected: {},
      wordsList: [],
      variationAccordion: false,
      checked: false,
      newVariation: '',
      isQuestion: false,
      wordVariations: [],
      generatedSentences: [],
      errors: {},
      submittingToTraining: false,
      openFinishModal: false,
      sentencesIntents: IntentSuggestion,
      token: null,
      loadingSelectingWords: false,
      loadingGenerateSentences: false,
    };
  },
  computed: {
    ...mapGetters({
      authenticated: 'authenticated',
      repositoryVersion: 'getSelectedVersion',
      repositoryUUID: 'getCurrentRepository',
      versionSelected: 'getSelectedVersion',
    }),
  },
  watch: {
    versionSelected() {
      this.intentSelected = '';
    },
    token() {
      this.checkGenerationStatus()
    }
  },
  methods: {
    ...mapActions([
      'setEditingStatus',
      'clearSelectedSuggestion',
      'setUpdateRepository',
      'getIntentSuggestion',
      'suggestWords',
      'suggestSentences',
      'newExample',
      'searchExamples',
      'recoverSentences'
    ]),
    updateLoading(intent) {
      this.loading = true;
      this.intentSelected = intent;
    },
    async setPhraseSuggestion(value) {
      const phraseValues = Object.values(value);
      this.setEditingStatus(false);
      if (phraseValues.length === 0) {
        this.clearPhraseList();
        this.loading = false;
        return;
      }
      const phraseFiltered = phraseValues[0].map((text, id) => {
        const phrase = {
          id,
          text,
        };
        return (
          phrase
        );
      });
      this.clearPhraseList();
      this.phraseList.items.push(...phraseFiltered);
      this.phraseList.total = phraseValues[0].length;
      this.loading = false;
    },
    clearPhraseList() {
      this.phraseList.items = [];
      this.phraseList.total = 0;
      this.clearSelectedSuggestion();
    },
    goToPreviousStep() {
      this.pageItem--
    },
    goToAddNewSentence() {
      this.isSentenceNew = true
      this.pageItem = 1
    },
    goToAddExistingSentence() {
      this.isSentenceNew = false
      this.pageItem = 1
    },
    onSentenceSelected(sentence) {
      this.sentenceSelected = sentence
      this.splitSentence()
      this.pageItem = 2
    },
    addSentence(sentence) {
      this.sentenceSelected = sentence
      this.intentSelected = sentence.intent
      this.splitSentence()
      this.pageItem = 2
    },
    async addVariations() {
      await this.addWordVariation();
      this.pageItem = 3
    },
    async goToGeneratedSentences() {
      await this.generateSentences();
      this.pageItem = 4
    },
    async addIntents(intent) {
      // this.loading = true
      const { id } = this.repository.intents.find(e => e.value === intent)
      this.phraseList = await this.searchExamples({
        repositoryUuid: this.repository.uuid,
        version: this.repositoryVersion,
        query: {
          intent_id: id,
        },
      });
    },
    splitSentence() {
      let words = this.sentenceSelected.text.split(' ')

      words.forEach((word) => {
        this.isQuestion = word.includes('?')
      })

      words = words.map((word, index) => ({
        word: word.replace('?', ''),
        generate: true,
        entity: this.sentenceSelected?.entities
          ?.filter(e => word === this.sentenceSelected.text.substring(e.start, e.end)) || ''
      }))

      this.wordsList = words
    },
    async addWordVariation() {
      this.loadingSelectingWords = true
      try {
        const { data } = await this.suggestWords({
          isQuestion: this.isQuestion,
          intent: this.intentSelected,
          texts: this.wordsList.map(e => ({
            ...e,
            entity: e?.entity[0]?.entity || ''
          }))
        });
        this.wordVariations = data.map(obj => {
          if (obj) {
            return {
              ...obj,
              inputs: obj.suggestions.map((suggestion, index) => ({
                text: suggestion,
                checked: index === 0
              })),
              suggestions: obj.suggestions.splice(0, 1),
              isOpen: obj.generate
            };
          }

          return obj;
        });
      } catch (e) {
        const message = this.$t('webapp.home.default_error');

        this.$buefy.toast.open({
          message,
          type: 'is-danger',
        });
      } finally {
        this.loadingSelectingWords = true
      }
    },
    updateWordsList(props) {
      this.wordsList = this.wordsList.map(obj => {
        if (obj.word === props.text) {
          return { ...obj, generate: props.value };
        }

        return obj;
      });
    },
    async generateSentences() {
      this.loadingGenerateSentences = true
      try {
        const { data } = await this.suggestSentences({
          isQuestion: this.isQuestion,
          intent: this.intentSelected,
          texts: this.wordVariations.map(e => ({
            ...e,
            entity: e.entity || ''
          }))
        });
        this.token = data
      } catch (e) {
        const message = this.$t('webapp.home.default_error');

        this.$buefy.toast.open({
          message,
          type: 'is-danger',
        });
      } finally {
        this.loadingGenerateSentences = false
      }
    },
    deleteSentence(item) {
      this.generatedSentences = this.generatedSentences.filter(sentence => sentence !== item)
    },
    addNewVariation(variation) {
      const newInput = { text: variation.newVariation, checked: false }
      this.wordVariations.find(e => e === variation)
        .inputs.push(newInput)
      this.setSuggestion(newInput, variation)
      variation.newVariation = ''
    },
    setSuggestion(input, variation) {
      input.checked = !input.checked
      variation.suggestions = variation.inputs
        .filter(e => e.checked === true)
        .map(e => e.text)
    },
    async onSubmitToTraining() {
      this.errors = {};
      await this.generatedSentences.forEach((e, index) => {
        this.submittingToTraining = true;
        try {
          this.newExample({
            repository: this.repository.uuid,
            repositoryVersion: this.repository.repository_version_id,
            ...this.generatedSentences[index],
          });

          this.submittingToTraining = false;

          this.openFinishModal = true
          return true;
        } catch (error) {
          /* istanbul ignore next */

          const errorResponse = error.response;
          const errorText = error.response.data;
          /* istanbul ignore next */
          if (errorText.detail[0] === 'Enter a valid value that has letters in it') {
            this.$buefy.toast.open({
              message: this.$t('webapp.trainings.error_caracter_type'),
              type: 'is-danger'
            });
          }
          if (errorResponse && errorText.detail[0] !== 'Enter a valid value that has letters in it') {
            /* istanbul ignore next */
            this.$buefy.toast.open({
              message: this.$t('webapp.trainings.intention_or_sentence_already_exist'),
              type: 'is-danger'
            });
            this.errors = errorResponse;
          }
          /* istanbul ignore next */
          this.submittingToTraining = false;
        }
        return false;
      })
    },
    goToInitialStep() {
      this.pageItem = 0
      this.openFinishModal = false
    },
    goToTraining() {
      this.$router.push(`/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/training`)
    },
    async checkGenerationStatus() {
      this.loading = true
      try {
        const { data } = await this.recoverSentences({ token: this.token })
        if (data) {
          const result = data.rasa_nlu_data.common_examples
          result.forEach(e => {
            e.language = this.repository.language
          })
          this.generatedSentences = result.map((sentence, index) => ({
            ...sentence,
            id: index
          }))
        }
      } catch (e) {
        const message = this.$t('webapp.home.default_error');

        this.$buefy.toast.open({
          message,
          type: 'is-danger',
        });
      } finally {
        this.loading = false
      }
    },
    updateGeneratedList(event) {
      Object.assign(this.generatedSentences.find(item => item.id === event.id), event)
    }
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.phrase-suggestion {
  font-family: $unnnic-font-family-secondary;

    &__header {
      &__container {
        display: flex;
        align-items: center;
        padding-bottom: $unnnic-spacing-stack-lg;
        margin-bottom: $unnnic-spacing-stack-lg;
        border-bottom: 1px solid $unnnic-color-neutral-soft;
      }

      &__title {
        display: flex;
        gap: $unnnic-spacing-stack-lg;
        margin-bottom: $unnnic-spacing-stack-sm;
        align-items: center;
      }

      &__subtitle {
        max-width: 50%;
        font-size: $unnnic-font-size-body-gt;
        color: $unnnic-color-neutral-dark;
        line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
      }

      &__back-button {
        cursor: pointer;
      }

      &__step {
        display: flex;
        align-items: center;

        h1 {
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-title-sm;
        }
      }
    }

    &__cards {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-stack-md;

      p {
        color: $unnnic-color-neutral-cloudy;
      }

      &__container {
        display: flex;
        gap: $unnnic-spacing-stack-sm;

        &-card {
          border-radius: $unnnic-border-radius-md;
          border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
          padding: $unnnic-spacing-stack-md;
          width: 50%;

          h3 {
            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-body-lg;
            font-weight: $unnnic-font-weight-bold;
            margin-bottom: $unnnic-spacing-stack-nano;
            color: $unnnic-color-neutral-darkest;
          }

          p {
            font-size: $unnnic-font-size-body-gt;
            color: $unnnic-color-neutral-cloudy;
            line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
            margin-bottom: $unnnic-spacing-stack-sm;
          }

          button {
            width: 100%;
          }
        }
      }

      &__variation {

        &-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: $unnnic-border-radius-md;
          border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
          padding: $unnnic-spacing-stack-md;
          margin-bottom: $unnnic-spacing-stack-lg;

          h3 {
            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-title-sm;
            font-weight: $unnnic-font-weight-regular;
            margin-bottom: $unnnic-spacing-stack-nano;
            color: $unnnic-color-neutral-dark;
          }

          p {
            font-size: $unnnic-font-size-body-gt;
            color: $unnnic-color-neutral-cloudy;
            line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
            margin-bottom: $unnnic-spacing-stack-sm;
          }

          span {
            color: $unnnic-color-neutral-dark;
            font-weight: $unnnic-font-weight-bold;
          }
        }
      }
    }

    &__word-cards {

      &__wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: $unnnic-spacing-stack-sm;
      }
    }

    .variation-accordion {

      span {
        font-size: $unnnic-font-size-body-gt;
        color: $unnnic-color-neutral-cloudy;
      }

      .divider {
        margin: 2rem 0 1rem;
        height: 1px;
      }
    }
    .button--full {
      width: 100%;
    }
    /deep/ .input {
      height: auto;
    }
    /deep/ .dropdown {
      display: block;
    }
    /deep/ .unnnic-accordion .header .title {
      margin-bottom: 0;
    }

    /deep/ input:focus, /deep/ textarea:focus {
      box-shadow: none;
      border-color: #9caccc;
    }

    /deep/ .actions {
      display: initial !important;
    }

    /deep/ .intent-suggestion-accordion__icons {
      margin-right: 0.5rem;
      margin-left: 1rem;
      overflow-wrap: anywhere;
    }

    h3 {
      font-family: $unnnic-font-family-secondary;
    }

    h4 {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-cloudy;
    }

    p, span {
      font-size: $unnnic-font-size-body-gt;
    }
  .divider {
    background: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-lg 0;
    height: 1px;
  }
  .add-variation {
    width: 160px;
  }

  &__beta-badge {
    background-color: rgba(0, 158, 150, 0.16) !important;
    color: $unnnic-color-brand-weni-soft !important;
    font-weight: $unnnic-font-weight-bold;
    padding: 4px 8px;
  }

}
</style>
