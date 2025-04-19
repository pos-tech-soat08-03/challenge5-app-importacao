import { VideoEntity } from "../../../../src/Core/Entity/VideoEntity";
import { userEntity } from "../../../../src/Core/Entity/ValueObject/UserEntity";
import { ProcessingConfigEntity } from "../../../../src/Core/Entity/ValueObject/ProcessingConfigEntity";
import { VideoImportEntity } from "../../../../src/Core/Entity/VideoImportEntity";
import { ProcessingStatusEnum } from "../../../../src/Core/Entity/ValueObject/ProcessingStatusEnum";



describe('Entities', () => {
    // Teste para VideoEntity
    describe('VideoEntity', () => {
        let video: VideoEntity;

        beforeEach(() => {
            video = new VideoEntity(
                'Título do vídeo',
                'Descrição do vídeo',
                'video.mp4',
                'mp4',
                's3:/caminho/para/o/video.mp4',
                104857600,
                'H264',
                300,
                30
            );
        });

        it('should correctly initialize video entity', () => {
            expect(video.getTitulo()).toBe('Título do vídeo');
            expect(video.getDescricao()).toBe('Descrição do vídeo');
            expect(video.getFileName()).toBe('video.mp4');
            expect(video.getFileExtension()).toBe('mp4');
            expect(video.getPath()).toBe('s3:/caminho/para/o/video.mp4');
            expect(video.getFileSize()).toBe(104857600);
            expect(video.getEncoding()).toBe('H264');
            expect(video.getDuration()).toBe(300);
            expect(video.getFps()).toBe(30);
        });

        it('should return a valid video id', () => {
            const videoId = video.getId();
            expect(videoId).toBeDefined();
            expect(videoId).toHaveLength(36); // UUID length
        });
    });

    // Teste para userEntity
    describe('userEntity', () => {
        let user: userEntity;

        beforeEach(() => {
            user = new userEntity(
                'uuid-do-usuario',
                'email@usuario.com',
                'PrimeiroNome',
                'UltimoNome',
                'authtoken123'
            );
        });

        it('should correctly initialize user entity', () => {
            expect(user).toBeDefined();
            expect(user['userId']).toBe('uuid-do-usuario');
            expect(user['email']).toBe('email@usuario.com');
            expect(user['firstName']).toBe('PrimeiroNome');
            expect(user['lastName']).toBe('UltimoNome');
            expect(user['authToken']).toBe('authtoken123');
        });

        it('should handle optional authToken', () => {
            const userWithoutToken = new userEntity(
                'uuid-do-usuario',
                'email@usuario.com',
                'PrimeiroNome',
                'UltimoNome'
            );
            expect(userWithoutToken['authToken']).toBeUndefined();
        });
    });

    // Teste para ProcessingConfigEntity
    describe('ProcessingConfigEntity', () => {
        let config: ProcessingConfigEntity;

        beforeEach(() => {
            config = new ProcessingConfigEntity('png', '1920x1080', 20);
        });

        it('should correctly initialize processing config entity', () => {
            expect(config.getOutputFormat()).toBe('png');
            expect(config.getResolution()).toBe('1920x1080');
            expect(config.getInterval()).toBe(20);
        });

        it('should generate a unique id for config if not provided', () => {
            const configId = config.getId();
            expect(configId).toBeDefined();
            expect(configId).toHaveLength(36); // UUID length
        });
    });

    // Teste para VideoImportEntity
    describe('VideoImportEntity', () => {
        let videoImport: VideoImportEntity;

        beforeEach(() => {
            videoImport = new VideoImportEntity(
                'uuid-do-video',
                'uuid-do-usuario',
                ProcessingStatusEnum.PENDING,
                0,
                'Iniciando importação...',
                new Date(),
                new Date(),
                null,
                'import-id-123'
            );
        });

        it('should correctly initialize video import entity', () => {
            expect(videoImport.getVideoId()).toBe('uuid-do-video');
            expect(videoImport.getUserId()).toBe('uuid-do-usuario');
            expect(videoImport.getImportStatus()).toBe(ProcessingStatusEnum.PENDING);
            expect(videoImport.getImportStatusPercentage()).toBe(0);
            expect(videoImport.getImportLog()).toBe('Iniciando importação...');
            expect(videoImport.getCreatedAt()).toBeDefined();
            expect(videoImport.getUpdatedAt()).toBeDefined();
            expect(videoImport.getFinishedAt()).toBeNull();
            expect(videoImport.getImportId()).toBe('import-id-123');
        });

        it('should update the import status', () => {
            videoImport.setImportStatus(ProcessingStatusEnum.IN_PROGRESS);
            expect(videoImport.getImportStatus()).toBe(ProcessingStatusEnum.IN_PROGRESS);
        });

        it('should update the import log', () => {
            const newLog = 'Importação em andamento...';
            videoImport.setImportLog(newLog);
            expect(videoImport.getImportLog()).toBe(newLog);
        });

        it('should correctly handle finishedAt date', () => {
            videoImport.setFinishedAt(new Date());
            expect(videoImport.getFinishedAt()).toBeInstanceOf(Date);
        });
    });
});
