# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def populate_level_characters(apps, schema_editor):

    Level = apps.get_model('game', 'Level')
    Character = apps.get_model('game', 'Character')

    wes = Character(name='Wes', en_face='/static/game/image/characters/Wes.svg',
                    top_down='/static/game/image/characters/Wes_topDown.svg')
    wes.save()

    van = Character.objects.get(pk=4)
    dee = Character.objects.get(name='Dee')

    levels = Level.objects.all()

    for level in levels:
        level.character = van
        level.save()

    level27 = Level.objects.get(pk=27)
    level27.character = dee
    level27.save()

    level28 = Level.objects.get(pk=28)
    level28.character = wes
    level28.save()



class Migration(migrations.Migration):

    dependencies = [
        ('game', '0075_auto_20140807_1228'),
    ]

    operations = [
        migrations.RunPython(populate_level_characters)
    ]