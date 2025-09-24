-- Chinese Vocabulary Flashcards Insert Script

-- Create a new flashcard list
INSERT INTO public.flashcard_lists (id, name, user_id) VALUES 
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Em yêu đổi tên danh sách nhé', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88');

-- Insert statements for Chinese vocabulary flashcards
INSERT INTO public.flashcards (list_id, front, back, user_id) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Từ trước đến nay', '{"chinese":"从来（cónglái）","pinyin":"from the past to the present; always","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Giấc ngủ trưa', '{"chinese":"午觉（wǔjiào）","pinyin":"afternoon nap","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bơi lội', '{"chinese":"游泳（yóu yǒng）","pinyin":"to swim","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Đi bộ', '{"chinese":"散步（sàn bù）","pinyin":"to go for a walk","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bài tập', '{"chinese":"功课（gōngkè）","pinyin":"schoolwork; homework","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nhớ', '{"chinese":"记（jì）","pinyin":"to remember","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ở', '{"chinese":"住（zhù）","pinyin":"used as the complement of a verb indicating fastness or steadiness","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nói chung', '{"chinese":"一般（yībān）","pinyin":"usual; general; common","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cảm ơn', '{"chinese":"感谢（gǎnxiè）","pinyin":"to thanks","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cha mẹ', '{"chinese":"父母（fùmǔ）","pinyin":"father and mother; parents","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cơ hội', '{"chinese":"机会（jīhuì）","pinyin":"chance; opportunity","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ban đầu', '{"chinese":"原来（yuánlái）","pinyin":"original; at first","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kéo dài', '{"chinese":"延长（yáncháng）","pinyin":"to lengthen; to extend","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Luyện tập', '{"chinese":"练（liàn）","pinyin":"to practice","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Khí công', '{"chinese":"气功（qìgōng）","pinyin":"qigong, a system of exercise","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Khá', '{"chinese":"好（hǎo）","pinyin":"quite","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Không chắc chắn', '{"chinese":"不一定（bù yīdìng）","pinyin":"not sure; not regular","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Giờ', '{"chinese":"钟头（zhōngtóu）","pinyin":"hour","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hiệu quả', '{"chinese":"效果（xiàoguǒ）","pinyin":"effect; result","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Khá...', '{"chinese":"挺...的（tǐng）","pinyin":"quite; rather","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lợi ích', '{"chinese":"好处（hǎochù）","pinyin":"benefit; advantage","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tác hại', '{"chinese":"坏处（huàichù）","pinyin":"harm; disadvantage","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bệnh mãn tính', '{"chinese":"慢性病（mànxìngbìng）","pinyin":"chronic disease","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cao huyết áp', '{"chinese":"高血压（gāoxuèyā）","pinyin":"hypertension","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mất ngủ', '{"chinese":"失眠（shī mián）","pinyin":"to suffer from insomnia","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sống', '{"chinese":"生活（shēnghuó）","pinyin":"to live; life","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gần như', '{"chinese":"差不多（chàbuduō）","pinyin":"nearly; almost","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quen thuộc', '{"chinese":"习惯（xíguàn）","pinyin":"to be accustomed/used to; habit","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nhưng', '{"chinese":"不过（búguò）","pinyin":"but; however","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Khí hậu', '{"chinese":"气候（qìhòu）","pinyin":"climate","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Khô ráo', '{"chinese":"干燥（gānzào）","pinyin":"dry; arid","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sạch sẽ', '{"chinese":"干净（gānjìng）","pinyin":"clean; neat and tidy","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Thức ăn', '{"chinese":"菜（cài）","pinyin":"food; dish","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dầu mỡ', '{"chinese":"油腻（yóunì）","pinyin":"oily; greasy","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sữa', '{"chinese":"牛奶（niúnǎi）","pinyin":"milk","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Giờ ra chơi', '{"chinese":"课间（kèjiān）","pinyin":"break (between classes)","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Miếng', '{"chinese":"块（kuài）","pinyin":"piece; chunk; lump","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bánh kẹo', '{"chinese":"点心（diǎnxīn）","pinyin":"pastry; snack","sentence":""}', '5bce5435-1ce1-445a-80c8-81a5ad7bcf88');