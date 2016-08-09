<template>
  <div id="block" :style="{height: String(block.duration * sizeConst) + 'px'}">
    <div id="nameContainer">
      <span id="blockNum" v-if="block.number">{{ block.number }}</span>
      <span v-if="block.name" id="blockName">{{ block.name }}</span>
      <input v-if="!block.name" id="blockInput" v-model="classes[block.number]" />
    </div>
    <div id="blockTime">{{ block.start }}-{{ block.end }}</div>
  </div>
</template>
<script>
  
  export default {
    props: ['block'],
    data() {
      return {
        classes: {
          1: 'Free Block',
          2: 'Spanish',
          3: 'AP Stats',
          4: 'AP Physics C',
          5: 'AP Gov',
          6: 'Econ CIS',
          7: 'Debate'
        },
        sizeConst: 2
      }
    }
  }
  
</script>
<style lang="stylus" scoped>
  
  font-styling()
    color: white
    font-family: "Montserrat"
    font-size: 18px
    line-height: 18px
    text-transform: uppercase
  
  #block
    width: 200px
    margin-bottom: calc(5px * 2)
    padding: 8px
    float: left
    box-sizing: border-box
    background: dodgerblue
    
    #nameContainer
      width: 100%
      float: left
      display: flex
      font-styling()
      
      #blockNum
        flex-shrink: 1
        margin-right: 6px
        font-weight: bold
        
      #blockName
        flex-grow: 1
        
      #blockInput
        height: 18px
        flex-grow: 1
        border: none
        outline: none
        background: transparent
        font-styling()
    
    #blockTime
      font-size: 13px
      color: white
  
  #block:last-child
    margin-bottom: 0
    
</style>
