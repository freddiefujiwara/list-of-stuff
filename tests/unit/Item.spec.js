import { shallowMount } from '@vue/test-utils'
import Item from '@/components/Item.vue'

describe('Item.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Item, {
      props: {
        comment: "I like it",
        genre: "for Kitchen",
        image: "https://tshop.r10s.jp/kenkocom/cabinet/248/4901111371248.jpg",
        price: 1340,
        title: "AGFBrandy",
        unit: 1,
        url: "https://example.com"
      }
    })
  })
  it('renders provided content', () => {
    expect(wrapper.text()).toMatch("I like it")
    expect(wrapper.text()).toMatch("for Kitchen")
    expect(wrapper.text()).toMatch("AGFBrandy")
    expect(wrapper.text()).toMatch("1,340円")
  })
  it('renders the provided image source', () => {
    expect(wrapper.find('img').attributes('src'))
      .toBe("https://tshop.r10s.jp/kenkocom/cabinet/248/4901111371248.jpg")
  })
  it('renders fallback image when none is provided', () => {
    wrapper = shallowMount(Item, {
      props: {
        comment: "I like it",
        genre: "for Kitchen",
        price: 1340,
        title: "AGFBrandy",
        unit: 1,
        url: "https://example.com"
      }
    })
    expect(wrapper.find('img').attributes('src')).toMatch('junbi.jpg')
  })
  it('renders props.url when passed', () => {
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })
})
