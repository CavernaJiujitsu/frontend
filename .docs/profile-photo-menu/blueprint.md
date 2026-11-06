# Blueprint

- Tela perfil: substituir callbacks que apenas referenciam funções por componente ProfilePhoto.
- Componente: modal compartilhado entre menu, seleção da origem e visualização; estado ocupado e erro visível também na web; usar tokens e DefaultButton (skill ui-style).
- expo-image-picker SDK 57 para câmera; expo-document-picker existente para upload JPG/PNG.
- Serviço profile: FormData com Blob/File na web e objeto uri/name/type nativo; manter nome file e rota PUT existente. Reconsultar perfil após mutações para preservar estatísticas.
- Backend: controller e DTO inspecionados; rota existente usa sub do JWT, limite de tamanho e validação do arquivo. Executar testes existentes.
- Documentação consultada: https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/
- Autorização para implementação e push direto fornecida pelo usuário nesta solicitação.
