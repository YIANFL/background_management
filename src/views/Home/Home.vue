<template>
  <div>
    home组件
    <button type="info" @click="logout">退出</button>
  </div>
</template>

<script>
export default {
  methods: {
    // 退出登陆
    logout () {
      sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
