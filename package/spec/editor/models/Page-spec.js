import {FilesCollection, Page, editor} from 'pageflow/editor';

import * as support from '$support';

describe('Page', () => {
  describe('#thumbnailFile', () => {
    beforeAll(() => {
      editor.pageTypes.register('audio', {});
      editor.pageTypes.setup([
        {
          name: 'video',
          thumbnail_candidates: [
            {
              attribute: 'thumbnail_id',
              file_collection: 'image_files',
            },
            {
              attribute: 'image_id',
              file_collection: 'image_files',
              condition: {
                attribute: 'background_type',
                value: 'image'
              }
            },
            {
              attribute: 'poster_id',
              file_collection: 'image_files',
              condition: {
                attribute: 'background_type',
                value: 'image',
                negated: true
              }
            }
          ]
        }
      ]);
    });

    support.setupGlobals({
      entry: function() {
        editor.fileTypes = support.factories.fileTypes(function() {
          this.withImageFileType();
        });

        return support.factories.entry({}, {
          fileTypes: editor.fileTypes,
          files: FilesCollection.createForFileTypes(
            editor.fileTypes,
            {
              image_files: [
                {id: 1, perma_id: 5},
                {id: 2, perma_id: 6}
              ]
            }
          )
        });
      }
    });

    it('returns first present file', () => {
      var page = new Page({
        template: 'video',
        configuration: {
          thumbnail_id: 5
        }
      });

      var thumbnailFile = page.thumbnailFile();

      expect(thumbnailFile.get('perma_id')).toBe(5);
    });

    it('returns undefined if no candidate matches', () => {
      var page = new Page({
        template: 'video',
        configuration: {}
      });

      var thumbnailFile = page.thumbnailFile();

      expect(thumbnailFile).toBeUndefined();
    });

    it('returns undefined if candidate condition is not met', () => {
      var page = new Page({
        template: 'video',
        configuration: {
          image_id: 5,
          background_type: 'video'
        }
      });

      var thumbnailFile = page.thumbnailFile();

      expect(thumbnailFile).toBeUndefined();
    });

    it('returns undefined if negated candidate condition is met', () => {
      var page = new Page({
        template: 'video',
        configuration: {
          poster_id: 5,
          background_type: 'image'
        }
      });

      var thumbnailFile = page.thumbnailFile();

      expect(thumbnailFile).toBeUndefined();
    });

    it('returns present file if candidate condition is met', () => {
      var page = new Page({
        template: 'video',
        configuration: {
          image_id: 5,
          background_type: 'image'
        }
      });

      var thumbnailFile = page.thumbnailFile();

      expect(thumbnailFile.get('perma_id')).toBe(5);
    });

    it(
      'returns present file if negated candidate condition is not met',
      () => {
        var page = new Page({
          template: 'video',
          configuration: {
            poster_id: 5,
            background_type: 'video'
          }
        });

        var thumbnailFile = page.thumbnailFile();

        expect(thumbnailFile.get('perma_id')).toBe(5);
      }
    );
  });
});
