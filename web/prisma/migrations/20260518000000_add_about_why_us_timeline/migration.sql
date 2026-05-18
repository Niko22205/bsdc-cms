-- AddColumn: AboutContent.whyUs and AboutContent.timeline
ALTER TABLE "AboutContent" ADD COLUMN "whyUs" JSONB;
ALTER TABLE "AboutContent" ADD COLUMN "timeline" JSONB;
