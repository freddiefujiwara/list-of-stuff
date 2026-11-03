import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Item from '../../src/components/Item.vue'

describe('Item.vue', () => {
  const buildProps = (overrides = {}) => ({
    comment: 'This is a comment',
    genre: 'Gear',
    image: 'https://example.com/image.jpg',
    price: 12345,
    title: 'Test Item',
    url: 'https://example.com',
    ...overrides,
  })

  const mountItem = (props = {}) => mount(Item, { props })

  it('renders all props correctly', () => {
    const props = buildProps()
    const wrapper = mountItem(props)

    expect(wrapper.text()).toContain(props.title)
    expect(wrapper.text()).toContain(props.comment)
    expect(wrapper.text()).toContain(props.genre)
    expect(wrapper.text()).toContain('12,345円')
    expect(wrapper.find('a').attributes('href')).toBe(props.url)
    expect(wrapper.find('img').attributes('src')).toBe(props.image)
  })

  it('uses the default image when no image prop is provided', () => {
    const { image, ...propsWithoutImage } = buildProps()
    const wrapper = mountItem(propsWithoutImage)

    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the fallback image when the image prop is a falsy string', () => {
    const wrapper = mountItem(buildProps({ image: '' }))

    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the fallback image when the image prop is whitespace', () => {
    const wrapper = mountItem(buildProps({ image: '   ' }))

    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the fallback image when the image prop is not a string', () => {
    const wrapper = mountItem(buildProps({ image: null }))

    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('shows the shortened genre label on the chip', () => {
    const wrapper = mountItem(buildProps({ genre: '【住】暮らしにまつわる物' }))

    expect(wrapper.find('.chip').text()).toBe('住・暮らし')
  })

  it('emits the raw genre when the shortened chip is clicked', async () => {
    const wrapper = mountItem(buildProps({ genre: '【住】暮らしにまつわる物' }))

    await wrapper.find('.chip').trigger('click')

    expect(wrapper.emitted('filter')[0]).toEqual(['【住】暮らしにまつわる物'])
  })

  it('renders an empty chip label when no genre is provided', () => {
    const wrapper = mountItem(buildProps({ genre: undefined }))

    expect(wrapper.find('.chip').text()).toBe('')
  })

  it('hides the comment when it is empty', () => {
    const wrapper = mountItem(buildProps({ comment: '' }))

    expect(wrapper.find('.comment').isVisible()).toBe(false)
  })

  it('hides the comment when it is only whitespace', () => {
    const wrapper = mountItem(buildProps({ comment: '   ' }))

    expect(wrapper.find('.comment').isVisible()).toBe(false)
  })

  it('hides the comment when it is not provided', () => {
    const wrapper = mountItem(buildProps({ comment: undefined }))

    expect(wrapper.find('.comment').isVisible()).toBe(false)
  })

  it('shows the unit count next to the price when more than one', () => {
    const wrapper = mountItem(buildProps({ unit: 3 }))

    expect(wrapper.find('.unit').text()).toBe('×3')
  })

  it('does not show the unit count when the unit is one', () => {
    const wrapper = mountItem(buildProps({ unit: 1 }))

    expect(wrapper.find('.unit').text()).toBe('')
  })

  it('does not show the unit count when no unit is provided', () => {
    const wrapper = mountItem(buildProps())

    expect(wrapper.find('.unit').text()).toBe('')
  })

  it('emits a "filter" event when the genre chip is clicked', async () => {
    const props = buildProps()
    const wrapper = mountItem(props)

    await wrapper.find('.chip').trigger('click')

    expect(wrapper.emitted('filter')).toBeTruthy()
    expect(wrapper.emitted('filter')[0]).toEqual([props.genre])
  })

  it('uses a fallback image when the primary image fails to load', async () => {
    const wrapper = mountItem(buildProps())

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('does not change the src if the image fails to load and the event has no target', async () => {
    const props = buildProps()
    const wrapper = mountItem(props)

    // directly calling the method on the vm is a way to test this
    wrapper.vm.handleImageError({ target: null })

    expect(wrapper.find('img').attributes('src')).toBe(props.image)
  })

  it('does not change the src if the image fails to load and the event is null', async () => {
    const props = buildProps()
    const wrapper = mountItem(props)

    // directly calling the method on the vm is a way to test this
    wrapper.vm.handleImageError(null)

    expect(wrapper.find('img').attributes('src')).toBe(props.image)
  })

  it('does not change the src if the fallback image has already failed', async () => {
    const wrapper = mountItem(buildProps())
    const img = wrapper.find('img')

    await img.trigger('error')
    expect(img.attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
    // Trigger error again
    await img.trigger('error')
    // Should not change the src
    expect(img.attributes('src')).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })

  it('uses the image URL exactly as provided', () => {
    const image = 'https://tshop.r10s.jp/shop/cabinet/item.jpg?_ex=400x400'
    const wrapper = mountItem(buildProps({ image }))

    expect(wrapper.find('img').attributes('src')).toBe(image)
  })

  it('loads images lazily with low priority by default', () => {
    const wrapper = mountItem()

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('fetchpriority')).toBe('low')
  })

  it('loads eagerly with high priority when the eager prop is set', () => {
    const wrapper = mountItem(buildProps({ eager: true }))

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
  })
})
