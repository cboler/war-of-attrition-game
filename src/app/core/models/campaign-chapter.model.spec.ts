import {
  CAMPAIGN_CHAPTER_ORDER,
  CAMPAIGN_CHAPTERS,
  chapterPrerequisitesThrough,
  getAuthoredCommanderId,
  getAuthoredCommanderSchedule,
  getCampaignChapter,
  isCampaignModeId,
  nextCampaignChapter
} from './campaign-chapter.model';

describe('CampaignChapterModel', () => {
  describe('Canonical 4-Chapter Order', () => {
    it('defines the exact sequential mode order', () => {
      expect(CAMPAIGN_CHAPTER_ORDER).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war',
        'total_war'
      ]);
    });

    it('identifies valid CampaignModeId values', () => {
      expect(isCampaignModeId('standard')).toBeTrue();
      expect(isCampaignModeId('limited_reserves')).toBeTrue();
      expect(isCampaignModeId('fog_of_war')).toBeTrue();
      expect(isCampaignModeId('total_war')).toBeTrue();
      expect(isCampaignModeId('invalid_mode')).toBeFalse();
      expect(isCampaignModeId(null)).toBeFalse();
      expect(isCampaignModeId(undefined)).toBeFalse();
    });
  });

  describe('Authored Encounter Schedules', () => {
    it('Standard (Chapter I: The Accord) matches Marcel -> Matthias -> Bastien', () => {
      const schedule = getAuthoredCommanderSchedule('standard');
      expect(schedule).toEqual(['quartermaster', 'analyst', 'attritionist']);
      expect(getAuthoredCommanderId('standard', 1)).toBe('quartermaster');
      expect(getAuthoredCommanderId('standard', 2)).toBe('analyst');
      expect(getAuthoredCommanderId('standard', 3)).toBe('attritionist');
    });

    it('Limited Reserves (Chapter II: The Closing Passes) matches Edmund -> Lorenzo -> Marcel', () => {
      const schedule = getAuthoredCommanderSchedule('limited_reserves');
      expect(schedule).toEqual(['gambler', 'cornered-general', 'quartermaster']);
      expect(getAuthoredCommanderId('limited_reserves', 1)).toBe('gambler');
      expect(getAuthoredCommanderId('limited_reserves', 2)).toBe('cornered-general');
      expect(getAuthoredCommanderId('limited_reserves', 3)).toBe('quartermaster');
    });

    it('Fog of War (Chapter III: The Blind Wheel) matches Matthias -> Marcel -> Bastien', () => {
      const schedule = getAuthoredCommanderSchedule('fog_of_war');
      expect(schedule).toEqual(['analyst', 'quartermaster', 'attritionist']);
      expect(getAuthoredCommanderId('fog_of_war', 1)).toBe('analyst');
      expect(getAuthoredCommanderId('fog_of_war', 2)).toBe('quartermaster');
      expect(getAuthoredCommanderId('fog_of_war', 3)).toBe('attritionist');
    });

    it('Total War (Chapter IV: The War of Attrition) matches Edmund -> Lorenzo -> Matthias', () => {
      const schedule = getAuthoredCommanderSchedule('total_war');
      expect(schedule).toEqual(['gambler', 'cornered-general', 'analyst']);
      expect(getAuthoredCommanderId('total_war', 1)).toBe('gambler');
      expect(getAuthoredCommanderId('total_war', 2)).toBe('cornered-general');
      expect(getAuthoredCommanderId('total_war', 3)).toBe('analyst');
    });
  });

  describe('Chapter Metadata & Definitions', () => {
    it('provides complete definitions for all 4 chapters', () => {
      const standard = getCampaignChapter('standard');
      expect(standard.chapter).toBe(1);
      expect(standard.title).toBe('The Accord');
      expect(standard.shortTitle).toBe('Chapter I');
      expect(standard.premise).toContain('Witness Wheels');

      const lr = getCampaignChapter('limited_reserves');
      expect(lr.chapter).toBe(2);
      expect(lr.title).toBe('The Closing Passes');
      expect(lr.shortTitle).toBe('Chapter II');
      expect(lr.premise).toContain('Five reserves');

      const fog = getCampaignChapter('fog_of_war');
      expect(fog.chapter).toBe(3);
      expect(fog.title).toBe('The Blind Wheel');
      expect(fog.shortTitle).toBe('Chapter III');
      expect(fog.premise).toContain('Boneyard will be sealed');

      const total = getCampaignChapter('total_war');
      expect(total.chapter).toBe(4);
      expect(total.title).toBe('The War of Attrition');
      expect(total.shortTitle).toBe('Chapter IV');
      expect(total.premise).toContain('Every margin enters the final account');
    });
  });

  describe('Progression and Prerequisite Navigation', () => {
    it('advances sequentially through the 4 chapters', () => {
      expect(nextCampaignChapter('standard')).toBe('limited_reserves');
      expect(nextCampaignChapter('limited_reserves')).toBe('fog_of_war');
      expect(nextCampaignChapter('fog_of_war')).toBe('total_war');
      expect(nextCampaignChapter('total_war')).toBeNull();
    });

    it('computes cumulative prerequisite sets for any reached mode', () => {
      expect(chapterPrerequisitesThrough('standard')).toEqual(['standard']);
      expect(chapterPrerequisitesThrough('limited_reserves')).toEqual([
        'standard',
        'limited_reserves'
      ]);
      expect(chapterPrerequisitesThrough('fog_of_war')).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war'
      ]);
      expect(chapterPrerequisitesThrough('total_war')).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war',
        'total_war'
      ]);
    });
  });
});
