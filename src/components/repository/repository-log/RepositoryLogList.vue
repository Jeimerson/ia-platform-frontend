<template>
  <div class="repository-log-list">
    <div class="repository-log-list__section">
      <b-notification v-if="loadingLogs" :closable="false">
        <b-loading :active.sync="loadingLogs" />
      </b-notification>
      <!-- <div>
        <b-checkbox v-model="select" :native-value="selectAll">
          {{ $t("webapp.inbox.select_all") }}
        </b-checkbox>
      </div> -->
      <!-- <div class="repository-log-list__section__buttonsIcon">
        <b-tooltip :label="$t('webapp.inbox.add_to_train_button')">
          <b-button
            id="tour-inbox-step-2"
            :is-previous-disabled="true"
            type="is-primary"
            icon-right="refresh"
            @click="showModalTraining($t('webapp.inbox.training'))"
          />
        </b-tooltip>
        <b-tooltip :label="$t('webapp.inbox.add_to_sentence_button')">
          <b-button
            id="tour-inbox-step-3"
            :is-previous-disabled="true"
            :is-next-disabled="true"
            icon-right="chat-processing"
            type="is-primary"
            @click="showModalSentence($t('webapp.inbox.test_sentences'))"
          />
        </b-tooltip>
      </div> -->
    </div>
    <intent-pagination
      :per-page="perPage"
      :item-component="logTable"
      :list="list"
      :loading.sync="loading"
      :is-accordion-open="pageWasChanged"
      :editable="editable"
      :is-searching="searchingLog"
      @event_nlp="nlp = $event"
      @event_addLog="addLogStructure($event)"
      @event_removeLog="removeLogStructure($event)"
      @pageChanged="pageChanged()"
      @onUpdateSelected="updateSelected"
    >
      <intent-data-loading slot="loader" />
    </intent-pagination>

    <h4 v-if="list && list.empty && !loading" class="repository-log-list__empty-message">
      {{ $t("webapp.inbox.list_empty") }}
    </h4>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import IntentPagination from '@/components/shared/IntentPagination';
import LogAccordion from '@/components/shared/accordion/LogAccordion';
import IntentModal from '@/components/repository/IntentModal';
import IntentModalEdition from '@/components/repository/IntentModalWithEdition';
import LogTable from '@/components/repository/LogTable';
import IntentDataLoading from '@/views/repository/loadings/IntentData';


export default {
  name: 'RepositoryLogList',
  components: {
    IntentPagination,
    LogAccordion,
    IntentModal,
    IntentModalEdition,
    IntentDataLoading
  },
  props: {
    query: {
      type: Object,
      default: null
    },
    perPage: {
      type: Number,
      default: 20
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: null,
      loading: false,
      logAccordion: LogAccordion,
      versionsList: null,
      versions: [],
      select: '',
      logData: [],
      selectAll: false,
      nlp: {},
      loadingLogs: false,
      pageWasChanged: false,
      searchingLog: false,
      logTable: LogTable
    };
  },
  computed: {
    ...mapGetters({
      repository: 'getCurrentRepository',
      version: 'getSelectedVersion',
      activeTutorial: 'activeTutorial'
    }),
    confidenceVerify() {
      if (this.logData.length > 1) {
        return true;
      }
      return false;
    },
    repositoryList() {
      if (!this.repository || this.repository.uuid === 'null') {
        return null;
      }
      return this.repository;
    }
  },
  watch: {
    loading() {
      this.logData = [];
      this.select = '';
    },
    query() {
      this.updateLogs();
      const filterValue = Object.values(this.query);
      if (filterValue.length !== 0) {
        this.searchingLog = true;
        return;
      }
      this.searchingLog = false;
    },
    select() {
      if (this.select === true) {
        this.logData = [];
      }
      this.$root.$emit('selectAll', this.select);
    },
    async repositoryUUID() {
      if (!this.repositoryUUID) {
        return;
      }
      this.updateLogs();
    }
  },
  methods: {
    ...mapActions(['searchLogs', 'newEvaluateExample', 'newExample', 'deleteExample']),
    addLogStructure(logValue) {
      this.logData.push(logValue);
    },
    removeLogStructure(logId) {
      this.logData = this.logData.filter(log => log.id !== logId);
    },
    pageChanged() {
      this.pageWasChanged = !this.pageWasChanged;
    },
    showModalTraining(typeModal) {
      if (this.activeTutorial === 'inbox') return;

      if (this.logData.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger'
        });
        return;
      }
      this.$buefy.modal.open({
        props: {
          info: this.nlp,
          repository: this.repository,
          titleHeader: typeModal,
          confidenceVerify: this.confidenceVerify,
          logData: this.logData[0],
          buttonLabel: this.$t('webapp.inbox.add_to_train')
        },
        parent: this,
        component: this.logData.length === 1 ? IntentModalEdition : IntentModal,
        hasModalCard: false,
        trapFocus: true,
        canCancel: false,
        events: {
          addedIntent: value => {
            this.verifyIsCorrected(value);
            this.addToTraining(value);
            this.intent = value;
          },
          closeModal: () => {
            this.logData = [];
            this.select = '';
            this.$root.$emit('selectAll', false);
          }
        }
      });
    },
    showModalSentence(typeModal) {
      if (this.logData.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger'
        });
        return;
      }
      this.$buefy.modal.open({
        props: {
          info: this.nlp,
          repository: this.repository,
          titleHeader: typeModal,
          logData: this.logData[0],
          buttonLabel: this.$t('webapp.inbox.add_to_sentence')
        },
        parent: this,
        component: this.logData.length === 1 ? IntentModalEdition : IntentModal,
        hasModalCard: false,
        trapFocus: true,
        canCancel: false,
        events: {
          addedIntent: value => {
            this.verifyIsCorrected(value);
            this.addToSentences(value);
            this.intent = value;
            if (this.activeTutorial === 'inbox') {
              this.$emit('finishedTutorial');
            }
          },
          closeModal: () => {
            this.logData = [];
            this.select = '';
            this.$root.$emit('selectAll', false);
            if (this.activeTutorial === 'inbox') {
              this.$emit('dispatchSkip');
            }
          }
        }
      });
      this.$nextTick(() => {
        this.$emit('dispatchNext');
      });
    },
    verifyIsCorrected(value) {
      if (value === this.nlp.intent.name) {
        this.isCorrected = false;
      } else {
        this.isCorrected = true;
      }
    },
    addToTraining(values) {
      this.loadingLogs = true;
      this.logData.map(async ({ data }) => {
        try {
          if (this.logData.length > 1) {
            await this.newExample({
              entities: data.entities,
              repository: data.repository,
              intent: values,
              language: data.language,
              text: data.text,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${data.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_train')}`,
              type: 'is-success'
            });
          } else {
            await this.newExample({
              ...data,
              intent: values.intent,
              text: values.text,
              entities: values.entities,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${values.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_train')}`,
              type: 'is-success'
            });
          }
        } catch (error) {
          this.showError(error, data, 'training');
        } finally {
          this.loadingLogs = false;
          this.select = false;
        }
      });
    },
    addToSentences(values) {
      this.loadingLogs = true;
      this.logData.map(async ({ data }) => {
        try {
          if (this.logData.length > 1) {
            await this.newEvaluateExample({
              entities: data.entities,
              repository: data.repository,
              intent: values,
              language: data.language,
              text: data.text,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${data.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_sentence')}`,
              type: 'is-success'
            });
          } else {
            await this.newEvaluateExample({
              ...data,
              intent: values.intent,
              text: values.text,
              entities: values.entities,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${values.text.bold()}, ${this.$t(
                'webapp.inbox.entry_has_add_to_sentence'
              )}`,
              type: 'is-success'
            });
          }
        } catch (error) {
          this.showError(error, data, 'evaluate');
        } finally {
          this.loadingLogs = false;
          this.select = false;
        }
      });
    },
    showError(error, log, type) {
      let messages = '';
      if (type === 'evaluate') {
        messages = Object.values(error.response.data.non_field_errors).length >= 1
          ? this.$t('webapp.inbox.send_to_evaluate')
          : '';
      } else {
        messages = Object.values(error.response.data).map(errors => (typeof errors === 'string' ? errors : Array.join(errors, ',')));
      }
      const message = `${log.text.bold()}, ${messages}`;
      this.$buefy.toast.open({
        message,
        type: 'is-danger'
      });
    },
    async updateLogs() {
      const languageObject = this.repository.repository_version_language.find(
        lang => lang.language === this.query.language
      );
      const { language, ...queryParams } = this.query;
      this.list = await this.searchLogs({
        repositoryVersionLanguage: languageObject.id,
        query: queryParams,
        limit: this.perPage
      });
    },
    updateSelected(params) {
      this.$emit('onUpdateSelected', params)
    },
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
.repository-log-list {
  &__pagination {
    margin-top: 1.25rem;
  }

  &__empty-message {
    margin: 2rem;
    text-align: center;
  }

  &__section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-grey-dark;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 0 0.6rem 0 1.6rem;

    @media screen and (max-width: $mobile-width) {
      padding: 0.6rem;
    }

    &__buttonsIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      > * {
        margin-left: 0.7rem;
      }
    }
  }
}
</style>
