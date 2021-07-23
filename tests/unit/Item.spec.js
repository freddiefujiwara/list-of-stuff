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
  it('renders props.comment when passed', () => {
    expect(wrapper.text()).toMatch("I like it")
  })
  it('renders props.genre when passed', () => {
    expect(wrapper.text()).toMatch("for Kitchen")
  })
  it('renders props.image when passed', () => {
    expect(wrapper.html()).toMatch('<img class="card-img-top" src="https://tshop')
  })
  it('renders blank props.imag', () => {
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
    expect(wrapper.html()).toMatch('junbi.jpg')
  })
  it('renders props.title when passed', () => {
    expect(wrapper.text()).toMatch("AGFBrandy")
  })
  it('renders props.price when passed', () => {
    expect(wrapper.text()).toMatch("1,340")
  })
  it('renders props.url when passed', () => {
    expect(wrapper.html()).toMatch('href="https://example.com"')
  })
})
