import Vue from 'vue'
import {reqGoods, reqRatings, reqInfo} from '../../api'
import {
  RECEIVE_GOODS,
  RECEIVE_RATINGS,
  RECEIVE_INFO,
  ADD_FOOD_COUNT,
  REDUCE_FOOD_COUNT
} from '../mutation-types'

const state = {
  goods: [], // 商品列表
  ratings: [], // 商家评价列表
  info: {}, // 商家信息
  cartFoods: [], // 购物车中food数组
}
const mutations = {
  [RECEIVE_INFO](state, {info}) {
    state.info = info
  },

  [RECEIVE_RATINGS](state, {ratings}) {
    state.ratings = ratings
  },

  [RECEIVE_GOODS](state, {goods}) {
    state.goods = goods
  },

  [ADD_FOOD_COUNT] (state, {food}) {
    if(!food.count) {
      // 给food添加一个新的属性, 内部不会进行数据劫持, 没有数据绑定
      // food.count = 1
      // 向响应式对象中添加一个属性，并确保这个新属性同样是响应式的
      Vue.set(food, 'count', 1)
      // 将food添加到购物车中
      state.cartFoods.push(food)

    } else {
      // 给food已有的属性值增加1
      food.count++
    }

  },

  [REDUCE_FOOD_COUNT] (state, {food}) {
    if(food.count>0) {
      food.count--

      if(food.count===0) {
        // 将food从购物车中删除
        state.cartFoods.splice(state.cartFoods.indexOf(food), 1)
      }
    }
  },


}
const actions = {
  async getGoods({commit}, cb) {
    const result = await reqGoods()
    if (result.code === 0) {
      const goods = result.data
      commit(RECEIVE_GOODS, {goods})
      typeof cb==='function' && cb()
    }
  },

  async getRatings({commit}, cb) {
    const result = await reqRatings()
    if (result.code === 0) {
      const ratings = result.data
      commit(RECEIVE_RATINGS, {ratings})
      typeof cb==='function' && cb()
    }
  },

  async getInfo({commit}) {
    const result = await reqInfo()
    if (result.code === 0) {
      const info = result.data
      commit(RECEIVE_INFO, {info})
    }
  },

  updateFoodCount ({commit}, {food, isAdd}) {
    if(isAdd) {
      commit(ADD_FOOD_COUNT, {food})
    } else {
      commit(REDUCE_FOOD_COUNT, {food})
    }
  }
}
const getters = {
  /*cartFoods (state) {
    const foods = []
    state.goods.forEach(good => {
      good.foods.forEach(food => {
        if(food.count>0) {
          foods.push(food)
        }
      })
    })
    return foods
  }*/

  totalCount (state) {
    return state.cartFoods.reduce((pre, food) => pre + food.count, 0)
  },

  totalPrice (state) {
    return state.cartFoods.reduce((pre, food) => pre + food.count*food.price, 0)
  },

  totalRatingCount (state) {
    return state.ratings.length
  },

  positiveRatingCount (state) {
    return state.ratings.reduce((pre, rating) => pre + (rating.rateType===0 ? 1 : 0), 0)
  },

  negativeRatingCount (state, getters) {
    return getters.totalRatingCount - getters.positiveRatingCount
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}