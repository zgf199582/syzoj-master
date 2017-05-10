/*
 *  This file is part of SYZOJ.
 *
 *  Copyright (c) 2016 Menci <huanghaorui301@gmail.com>
 *
 *  SYZOJ is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  SYZOJ is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public
 *  License along with SYZOJ. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

let User = syzoj.model('user');
let Article = syzoj.model('article');
let Contest = syzoj.model('contest');
let Divine = require('syzoj-divine');

app.get('/', async (req, res) => {
  try {
    let ranklist = await User.query([1, 10], { is_show: true }, [['ac_num', 'desc']]);
    await ranklist.forEachAsync(async x => x.renderInformation());

    let notices = await syzoj.config.notices.mapAsync(async notice => {
      if (notice.type === 'link') return notice;
      else if (notice.type === 'article') {
        let article = await Article.fromID(notice.id);
        if (!article) throw new ErrorMessage(`无此帖子：${notice.id}`);
        return {
          title: article.title,
          url: syzoj.utils.makeUrl(['article', article.id]),
          date: syzoj.utils.formatDate(article.public_time, 'L')
        };
      }
    });

    let fortune = null;
    if (res.locals.user) {
      fortune = Divine(res.locals.user.username, res.locals.user.sex);
    }

    let contests = await Contest.query([1, 5], null, [['start_time', 'desc']]);

    let hitokoto;
    try {
      hitokoto = await syzoj.utils.hitokoto();
    } catch (e) {
      syzoj.log(e);
      hitokoto = null;
    }

    res.render('index', {
      ranklist: ranklist,
      notices: notices,
      fortune: fortune,
      contests: contests,
      hitokoto: hitokoto
    });
  } catch (e) {
    syzoj.log(e);
    res.render('error', {
      err: e
    });
  }
});

app.get('/help', async (req, res) => {
  try {
    res.render('help');
  } catch (e) {
    syzoj.log(e);
    res.render('error', {
      err: e
    });
  }
});
