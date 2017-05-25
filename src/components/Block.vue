<style lang="sass" scoped>
  
  .block
    border-radius: 4px
    background: rgb(150, 150, 150)
    transition: background 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)
    display: flex
    flex-direction: row
    
  .blockHeader
    padding: 4px 4px 4px 6px
    flex-grow: 1
    display: flex
    flex-flow: row wrap
    align-content: flex-start
    
  .blockName
    margin: 0 0 2px
    flex-grow: 1
    font-weight: 300
    
  .blockNum
    height: 23px
    margin: 0 4px 0 0
    line-height: 23px
    font-weight: 700
    
  .blockInput
    // Necessary so countdown doesn't overflow block
    width: 0
    height: 21px
    margin: 0 0 2px 0
    border: none
    outline: none
    flex-grow: 1
    background: transparent
    line-height: 21px
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif
    font-weight: 300
    font-size: 18px
    color: white
    
  .blockInput:focus
    margin: 0
    border-bottom: 2px solid white
    
  .canToggle
    cursor: pointer
    
  .isFree
    background: transparent !important
    
  .classTimes
    width: 100%
    margin-top: 2px
    font-size: 12px
    
  .countdown
    width: 74px
    flex-shrink: 1
    display: flex
    flex-flow: column
    justify-content: center
    align-items: center
    text-align: center
    font-weight: 300
    
  .before
    text-transform: uppercase
    font-size: 11px
    line-height: 11px
    
</style>
<template>
  <div class="blockContainer" :title="block.number ? className : block.name">
    <div class="offset" :style="offsetStyles"></div>
    <div class="block" :style="blockStyles"
      @click="block.lunch ? toggleLunch(date) : null"
      :class="{isFree, canToggle}">
      <header class="blockHeader" v-if="block.duration >= 25">
        <span class="blockName" v-if="block.name">{{ block.name }}</span>
        <template v-if="block.number">
          <span class="blockNum">{{ block.number }}</span>
          <input class="blockInput" v-model="className" @click.stop
            :autofocus="block.autofocus" />
        </template>
        <div class="classTimes" v-if="block.duration >= 40">
          {{ block.start }}-{{ block.end }}
        </div>
      </header>
      <transition name="fade" mode="out-in" appear>
        <div class="countdown" :key="countdown.before" v-if="showCountdown">
          {{ countdown.time }}
          <div v-if="countdown.before" class="before">Before</div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
  
  import {mapState, mapMutations, mapActions} from 'vuex'
  
  export default {
    props: ['block', 'date'],
    methods: {
      ...mapMutations(['SET_CLASS']),
      ...mapActions(['toggleLunch'])
    },
    computed: {
      ...mapState({
        sizing: 'sizing',
        colors: 'colors',
        classes: 'classes',
        countdown: state => state.countdown.data
      }),
      className: {
        get() {
          return this.classes[this.block.number]
        },
        set(text) {
          this.SET_CLASS({number: this.block.number, text})
        }
      },
      canToggle() {
        return this.block.lunch
      },
      isFree() {
        const num = this.block.number
        return /free|tasc|tutorial|lunch/gim.test(num ? this.classes[num] : this.block.name)
      },
      showCountdown() {
        return this.countdown.id === this.block.id && this.block.duration >= 25
      },
      offsetStyles() {
        return {
          height: `${String(this.sizing * this.block.offset)}px`
        }
      },
      blockStyles() {
        return {
          height: `${String(this.sizing * this.block.duration)}px`,
          background: this.colors[this.block.number]
        }
      }
    }
  }
  
</script>
