<style lang="sass">
  
  .dayContainer
    // Force all days to be equal widths
    width: 0
    max-width: 400px
    margin: 5px
    flex: 1 1 auto
    
  .dayHeader
    height: 30px
    margin: 0 0 4px 0
    text-align: center
    
  .notice
    min-height: 200px
    display: flex
    align-items: center
    justify-content: center
    
  .day
    height: calc(100% - 34px)
    
  .list-move
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)
    
</style>
<template>
  <div class="dayContainer">
    <header class="dayHeader">{{ headerText }}</header>
    <div class="notice" v-if="showNotice">{{ schedule }}</div>
    <transition-group name="list" tag="div" class="day" v-else>
      <Block v-for="block in schedule" :key="block.id" :block="block" :date="date"></Block>
    </transition-group>
  </div>
</template>
<script>
  
  import Block from '@/components/Block.vue'
  import moment from 'moment'
  
  export default {
    components: {Block},
    props: ['date'],
    computed: {
      schedule() {
        return this.$store.state.schedules[this.date]
      },
      showNotice() {
        return !Array.isArray(this.schedule)
      },
      headerText() {
        return moment(this.date).format('dddd, M/D')
      }
    }
  }
  
</script>
