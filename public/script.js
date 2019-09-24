import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.0/dist/vue.esm.browser.js'
// import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.0/dist/vue.esm.browser.min.js'

new Vue({
  el: '#app',
  data() {
    return {
      loading: false,

      guilds: null,
      aGuildChannelsModal: null,
      aGuildChannelsModalLoading: false,

      dmChannels: null,

      purgeLoading: false,
      purgeLoadingChannelName: null
    }
  },
  async mounted() {
    this.loading = true
    try {
      await Promise.all([this.getGuilds(), this.getDmChannels()])
    }
    catch (err) {
      console.error(err)
    }
    finally {
      this.loading = false
    }
  },
  methods: {
    async apiCall(route, method = 'GET', body) {
      const res = await fetch(`/api${route}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error(`Error ${res.status} - ${(await res.json()).message}`);
      return (await res.json()).data
    },

    async getGuilds() {
      this.guilds = await this.apiCall('/guilds')
    },

    async getDmChannels() {
      this.dmChannels = await this.apiCall('/dmChannels')
    },

    async showGuildTextChannels(guildId) {
      this.aGuildChannelsModalLoading = true
      try {
        this.aGuildChannelsModal = await this.apiCall(`/guild/${guildId}`)
      }
      catch (err) {
        console.error(err)
      }
      finally {
        this.aGuildChannelsModalLoading = false
      }
    },

    async purgeChannelMessages(channelId, name) {
      console.log(`Asking to purge the channel ID = ${channelId}`)
      console.log(name)
      if (!confirm(`Are you sure you want to purge your messages from the following channel ?\n\nChannel ID = ${channelId}\n\n${name}\n\nThis cannot be undone and will take some time.`))
        return

      this.purgeLoading = true
      this.purgeLoadingChannelName = name
      try {
        this.aGuildChannelsModal = await this.apiCall('/purge', 'POST', { channelId })
      }
      catch (err) {
        console.error(err)
      }
      finally {
        this.purgeLoading = false
        this.purgeLoadingChannelName = null
      }
    }
  }
})

Vue.config.devtools = true
