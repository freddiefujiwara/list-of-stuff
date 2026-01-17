import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Item from '../../src/components/Item.vue'

describe('Item.vue', () => {
  const props = {
    comment: 'This is a comment',
    genre: 'Gear',
    image: 'https://example.com/image.jpg',
    price: 12345,
    title: 'Test Item',
    url: 'https://example.com',
  }

  it('renders all props correctly', () => {
    const wrapper = mount(Item, { props })
    expect(wrapper.text()).toContain(props.title)
    expect(wrapper.text()).toContain(props.comment)
    expect(wrapper.text()).toContain(props.genre)
    expect(wrapper.text()).toContain('12,345円')
    expect(wrapper.find('a').attributes('href')).toBe(props.url)
    expect(wrapper.find('img').attributes('src')).toBe(props.image)
  })

  it('uses the default image when no image prop is provided', () => {
    const { image, ...propsWithoutImage } = props
    const wrapper = mount(Item, { props: propsWithoutImage })
    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the fallback image when the image prop is a falsy string', () => {
    const wrapper = mount(Item, { props: { ...props, image: '' } })
    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the fallback image when the image prop is whitespace', () => {
    const wrapper = mount(Item, { props: { ...props, image: '   ' } })
    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the fallback image when the image prop is not a string', () => {
    const wrapper = mount(Item, { props: { ...props, image: null } })
    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('emits a "filter" event when the genre chip is clicked', async () => {
    const wrapper = mount(Item, { props })
    await wrapper.find('.chip').trigger('click')
    expect(wrapper.emitted('filter')).toBeTruthy()
    expect(wrapper.emitted('filter')[0]).toEqual([props.genre])
  })

  it('uses a fallback image when the primary image fails to load', async () => {
    const wrapper = mount(Item, { props })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('does not change the src if the image fails to load and the event has no target', async () => {
    const wrapper = mount(Item, { props })
    // directly calling the method on the vm is a way to test this
    wrapper.vm.handleImageError({ target: null })
    expect(wrapper.find('img').attributes('src')).toBe(props.image)
  })

  it('does not change the src if the image fails to load and the event is null', async () => {
    const wrapper = mount(Item, { props })
    // directly calling the method on the vm is a way to test this
    wrapper.vm.handleImageError(null)
    expect(wrapper.find('img').attributes('src')).toBe(props.image)
  })

  it('does not change the src if the fallback image has already failed', async () => {
    const wrapper = mount(Item, { props })
    const img = wrapper.find('img')
    await img.trigger('error')
    expect(img.attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
    // Trigger error again
    await img.trigger('error')
    // Should not change the src
    expect(img.attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })
})
