const htmlToJson = require('html-to-json')
const {
  removeLineBreaks,
  ignoreNonNumeric
} = require('../functions/string')

const getAnime = async (url) =>
  await htmlToJson.request(`https://myanimelist.net/anime${url}`, {
    // Title, banner, synopsis
    title:      ($doc) => $doc.find('h1').text(),
    banner:     ($doc) => $doc.find(`img[itemprop="image"]`).attr('src'),
    synopsis:   ($doc) => $doc.find(`span[itemprop="description"]`).text(),
    // Information
    type:       ($doc) => $doc.find(`span:contains('Type:')`).next().text(),
    episodes:   ($doc) => removeLineBreaks($doc.find(`span:contains('Episodes:')`).parent().text().replace(/Episodes:/g,'')),
    status:     ($doc) => $doc.find(`span:contains('Status:')`).parent().find('span').remove().end().text().replace(/\r?\n|\r/g, '').trim(),
    aired:      ($doc) => removeLineBreaks($doc.find(`span:contains('Aired:')`).parent().text()).replace(/Aired:/g,'').trim(),
    producers:  ($doc) => $doc.find(`span:contains('Producers:')`).parent().text().replace(/Producers:/g,'').split(',').map(x => removeLineBreaks(x)),
    licensors:  ($doc) => $doc.find(`span:contains('Licensors:')`).parent().text().replace(/Licensors:/g,'').split(',').map(x => removeLineBreaks(x)),
    studios:    ($doc) => $doc.find(`span:contains('Studios:')`).parent().text().replace(/Studios:/g,'').split(',').map(x => removeLineBreaks(x)),
    source:     ($doc) => $doc.find(`span.dark_text:contains('Source:')`).parent().text().replace(/Source:/g,'').trim(),
    genres:     [`[href^="/anime/genre/"]`, $x => $x.text()],
    duration:   ($doc) => removeLineBreaks($doc.find(`span:contains('Duration:')`).parent().text()).replace(/Duration:/g,'').trim(),
    rating:     ($doc) => removeLineBreaks($doc.find(`span:contains('Rating:')`).parent().text()).replace(/Rating:/g,'').trim(),
    // Statistics
    score:      ($doc) => $doc.find(`span[itemprop="ratingValue"]`).text(),
    scored_by:  ($doc) => $doc.find(`span[itemprop="ratingCount"]`).text(),
    ranked:     ($doc) => removeLineBreaks(ignoreNonNumeric($doc.find(`.numbers.ranked`).text()).replace(/Ranked #/g,'').trim()),
    popularity: ($doc) => removeLineBreaks(ignoreNonNumeric($doc.find(`span:contains('Popularity:')`).parent().text()).replace(/Popularity:/g,'').trim()),
    members:    ($doc) => removeLineBreaks($doc.find(`span:contains('Members:')`).parent().text()).replace(/Members:/g,'').trim(),
    favorites:  ($doc) => removeLineBreaks($doc.find(`span:contains('Favorites:')`).parent().text()).replace(/Favorites:/g,'').trim(),
    // Related
    related:  ($doc) => {
      return {
        adaptation:   $doc.find(`td:contains('Adaptation:')`).next().text().split(',').map(x => removeLineBreaks(x)),
        prequel:      $doc.find(`td:contains('Prequel:')`).next().text().split(',').map(x => removeLineBreaks(x)),
        sequel:       $doc.find(`td:contains('Sequel:')`).next().text().split(',').map(x => removeLineBreaks(x)),
        side_story:   $doc.find(`td:contains('Side story:')`).next().text().split(',').map(x => removeLineBreaks(x)),
      }
    },
    // Characters & voice actors
    characters: [`h2:contains('Characters & Voice Actors')+.detail-characters-list tr .picSurround a[href^="https://myanimelist.net/character/"] img`, $x => {
      return {
        char_img: $x.attr('data-src') || undefined,
        char_name: removeLineBreaks($x.parent().parent().parent().next().find('a').text()) || undefined,
        char_type: removeLineBreaks($x.parent().parent().parent().next().find('div small').text()) || undefined,
        actor_img: $x.parent().parent().parent().next().next().find('.picSurround a img').attr('data-src') || undefined,
        actor_name: $x.parent().parent().parent().next().next().find('.va-t a').attr('href') || undefined,
        actor_type: $x.parent().parent().parent().next().next().find('.va-t small').text() || undefined,
      }
    }],
  })

module.exports = getAnime