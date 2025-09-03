<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <Recommendations 
          :application="application" 
          :recommenders="recommenders"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Application, Recommender } from 'src/shared-types'
import { useRecommenderStore } from 'src/stores/recommender.store'
import Recommendations from 'src/components/Recommendations.vue'
import { useUserStore } from 'src/stores/user.store'

const props = defineProps<{
  application: Application | null
}>()

const application = computed(() => props.application)
const recommenderStore = useRecommenderStore()
const recommenders = ref<Recommender[]>([])
const userStore = useUserStore()

const loadRecommenders = async () => {
  try {
    const user_id = userStore.user?.user_id
    if (user_id) {
      recommenders.value = await recommenderStore.getRecommendersByUserId(user_id)
    }
  } catch (error) {
    console.error('Failed to load recommenders:', error)
  }
}

onMounted(async () => {
  await loadRecommenders()
})
</script> 