import { DefaultButton } from '@/components/customized/default-button';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BELTS = [
  { id: 'white', name: 'Branca', color: '⚪' },
  { id: 'yellow', name: 'Amarela', color: '🟡' },
  { id: 'orange', name: 'Laranja', color: '🟠' },
  { id: 'green', name: 'Verde', color: '🟢' },
  { id: 'blue', name: 'Azul', color: '🔵' },
  { id: 'purple', name: 'Roxa', color: '🟣' },
  { id: 'brown', name: 'Marrom', color: '🟤' },
  { id: 'black', name: 'Preta', color: '⚫' },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function BeltInfoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [selectedBelt, setSelectedBelt] = useState<string>('blue');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
          Alert.alert(
            'Arquivo muito grande',
            'O tamanho máximo permitido para o certificado é de 5MB.'
          );
          return;
        }

        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleContinue = async () => {
    if (!selectedBelt) {
      Alert.alert('Atenção', 'Selecione uma faixa para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedFile) {
        const formData = new FormData();

        if (selectedFile.file) {
          formData.append('file', selectedFile.file);
        } else {
          formData.append('file', {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.mimeType || 'application/pdf',
          } as any);
        }

        formData.append('belt', selectedBelt);

        const response = await fetch('http://localhost:3000/certificates/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Falha no upload do certificado');
        }
      }

      // CORREÇÃO DOS ESTADOS:
      setIsLoading(false);
      setIsSuccess(true);

      // Redireciona após 1.5s
      setTimeout(() => {
        router.replace('/onboarding/belt-info'); 
      }, 1500);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar os dados. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.cardContainer, isSmallScreen && styles.cardContainerSmall]}>
          
          {/* BANNER DE NOTIFICAÇÃO SUPERIOR */}
          {isSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                ✅ Dados e certificado enviados com sucesso!
              </Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Informe sua faixa</Text>
            <Text style={styles.subtitle}>
              Um professor homologado vai validar na sua primeira aula.
            </Text>
          </View>

          <View style={styles.beltsGrid}>
            {BELTS.map((belt) => {
              const isSelected = selectedBelt === belt.id;
              return (
                <TouchableOpacity
                  key={belt.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedBelt(belt.id)}
                  disabled={isLoading || isSuccess}
                  style={[
                    styles.beltChip,
                    isSelected && styles.selectedBeltChip,
                    isSmallScreen && styles.beltChipSmall,
                  ]}
                >
                  <Text style={styles.emoji}>{belt.color}</Text>
                  <Text style={[styles.beltText, isSelected && styles.selectedBeltText]}>
                    {belt.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickFile}
            disabled={isLoading || isSuccess}
            style={[
              styles.uploadCard,
              selectedFile && styles.uploadCardSelected,
              isSmallScreen && styles.uploadCardSmall,
            ]}
          >
            <View style={styles.uploadHeader}>
              <Text style={styles.uploadEmoji}>{selectedFile ? '✅' : '📄'}</Text>
              <Text style={styles.uploadTitle} numberOfLines={1}>
                {selectedFile ? selectedFile.name : 'Enviar certificado (opcional)'}
              </Text>
            </View>
            <Text style={styles.uploadDescription}>
              {selectedFile
                ? `Tamanho: ${(selectedFile.size! / (1024 * 1024)).toFixed(2)} MB.`
                : 'Toque para anexar uma foto ou PDF do seu certificado (máx. 5MB).'}
            </Text>

            {selectedFile && !isSuccess && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveFile}
                disabled={isLoading}
              >
                <Text style={styles.removeButtonText}>Upload concluído. Toque para substituir</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Sem certificado? Sem problema — o professor confirma sua faixa na aula.
          </Text>

          <View style={styles.footer}>
            <DefaultButton
              label={
                isLoading
                  ? 'Enviando...'
                  : isSuccess
                  ? 'Enviado com Sucesso! ✅'
                  : 'Continuar'
              }
              color={isSuccess ? '#00B894' : '#FF6B35'}
              action={handleContinue}
              disabled={!selectedBelt || isLoading || isSuccess}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#121620',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#1E2330',
    gap: 16,
  },
  cardContainerSmall: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderRadius: 16,
  },
  successBanner: {
    backgroundColor: 'rgba(0, 184, 148, 0.15)',
    borderWidth: 1,
    borderColor: '#00B894',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  successBannerText: {
    color: '#00B894',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  beltsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  beltChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C27',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  beltChipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  selectedBeltChip: {
    borderColor: '#00B894',
    backgroundColor: '#162224',
  },
  emoji: {
    fontSize: 13,
  },
  beltText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedBeltText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  uploadCard: {
    width: '100%',
    backgroundColor: '#181C27',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2D37',
    marginTop: 4,
  },
  uploadCardSmall: {
    padding: 12,
  },
  uploadCardSelected: {
    borderColor: '#00B894',
    backgroundColor: '#142022',
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  uploadEmoji: {
    fontSize: 18,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  uploadDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  removeButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#ade766',
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
    width: '100%',
  },
});