import { describe, it, expect } from 'vitest'
import {
  GENRE_SLUGS,
  genreForSlug,
  pathForGenre,
  slugForGenre,
  slugFromPath,
} from '../../src/utils/genrePath'

describe('genrePath helpers', () => {
  const genres = [
    '【電】家電にまつわる物',
    '【食】キッチンにまつわる物',
    '【住】暮らしにまつわる物',
    '【衣】服にまつわる物',
    '【携】携帯にまつわる物',
    '【健】健康にまつわる物',
    'Gear',
  ]

  it('defines the slug table for the six genre marks', () => {
    expect(GENRE_SLUGS).toEqual({
      電: 'electronics',
      食: 'kitchen',
      住: 'living',
      衣: 'clothing',
      携: 'mobile',
      健: 'health',
    })
  })

  it('slugForGenre maps each genre mark to its slug', () => {
    expect(slugForGenre('【電】家電にまつわる物')).toBe('electronics')
    expect(slugForGenre('【食】キッチンにまつわる物')).toBe('kitchen')
    expect(slugForGenre('【住】暮らしにまつわる物')).toBe('living')
    expect(slugForGenre('【衣】服にまつわる物')).toBe('clothing')
    expect(slugForGenre('【携】携帯にまつわる物')).toBe('mobile')
    expect(slugForGenre('【健】健康にまつわる物')).toBe('health')
  })

  it('slugForGenre returns null for genres without a path', () => {
    expect(slugForGenre('Gear')).toBeNull()
    expect(slugForGenre('【他】その他にまつわる物')).toBeNull()
    expect(slugForGenre('')).toBeNull()
  })

  it('genreForSlug finds the genre string for a slug', () => {
    expect(genreForSlug(genres, 'electronics')).toBe('【電】家電にまつわる物')
    expect(genreForSlug(genres, 'health')).toBe('【健】健康にまつわる物')
  })

  it('genreForSlug returns an empty string when nothing matches', () => {
    expect(genreForSlug(genres, 'unknown')).toBe('')
    expect(genreForSlug(genres, '')).toBe('')
    expect(genreForSlug([], 'electronics')).toBe('')
  })

  it('slugFromPath extracts the slug below the base', () => {
    expect(slugFromPath('/list-of-stuff/electronics', '/list-of-stuff/')).toBe('electronics')
    expect(slugFromPath('/list-of-stuff/electronics/', '/list-of-stuff/')).toBe('electronics')
    expect(slugFromPath('/list-of-stuff/', '/list-of-stuff/')).toBe('')
    expect(slugFromPath('/electronics', '/')).toBe('electronics')
    expect(slugFromPath('/', '/')).toBe('')
    expect(slugFromPath('/electronics')).toBe('electronics')
  })

  it('slugFromPath returns an empty string outside the base', () => {
    expect(slugFromPath('/blog/electronics', '/list-of-stuff/')).toBe('')
  })

  it('slugFromPath accepts a base without a trailing slash', () => {
    expect(slugFromPath('/list-of-stuff/kitchen', '/list-of-stuff')).toBe('kitchen')
  })

  it('pathForGenre builds the shareable path for a genre', () => {
    expect(pathForGenre('【電】家電にまつわる物', '/list-of-stuff/')).toBe(
      '/list-of-stuff/electronics'
    )
    expect(pathForGenre('【電】家電にまつわる物', '/list-of-stuff')).toBe(
      '/list-of-stuff/electronics'
    )
    expect(pathForGenre('【電】家電にまつわる物')).toBe('/electronics')
  })

  it('pathForGenre falls back to the base for genres without a path and for no selection', () => {
    expect(pathForGenre('Gear', '/list-of-stuff/')).toBe('/list-of-stuff/')
    expect(pathForGenre('', '/list-of-stuff/')).toBe('/list-of-stuff/')
  })
})
