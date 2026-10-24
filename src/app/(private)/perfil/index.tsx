import { profileStyles } from "@/styles/private/profileStyles";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { useState } from "react";

export default function Perfil() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <ScreenLayout bottomNav={<BottomNavbar/>}>
      <ScrollView contentContainerStyle={[globalStyles.container, styles.content, profileStyles.scrollContainer]}>
      
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Perfil
          </Text>
          <Text style={styles.greetingSub}>Seus dados e sua graduação</Text>
        </View>
        
        <View style={profileStyles.profileHeader}>
          <View style={profileStyles.avatarPlaceholder}/>
          <Text style={profileStyles.name}>Nome do usuário</Text>
          <View style={profileStyles.badge}>
            <Text style={profileStyles.badgeText}>Faixa: Azul</Text>
          </View>
        </View>

        <View style={profileStyles.statsContainer}>
          <View style={profileStyles.statBox}>
            <Text style={profileStyles.statValue}>10</Text>
            <Text style={profileStyles.statLabel}>Horas</Text>
          </View>
          <View style={profileStyles.statBox}>
            <Text style={profileStyles.statValue}>5</Text>
            <Text style={profileStyles.statLabel}>Aulas</Text>
          </View>
          <View style={profileStyles.statBox}>
            <Text style={profileStyles.statValue}>6</Text>
            <Text style={profileStyles.statLabel}>Sequências</Text>
          </View>
        </View>

        <View style={profileStyles.accordionGroup}>
          <View style={profileStyles.accordionItem}>
            <TouchableOpacity onPress={() => toggleAccordion("edit")} activeOpacity={0.7}>
              <Text style={profileStyles.accordionTitle}>Editar Perfil</Text>
            </TouchableOpacity>
            {openSection === "edit" && (
              <View style={profileStyles.accordionContent}>
                <Text style={profileStyles.subText}>Conteúdo do Editar Perfil</Text>
              </View>
            )}
          </View>

          <View style={profileStyles.accordionItem}>
            <TouchableOpacity onPress={() => toggleAccordion("certificates")} activeOpacity={0.7}>
              <Text style={profileStyles.accordionTitle}>Certificados</Text>
            </TouchableOpacity>
            {openSection === "certificates" && (
              <View style={profileStyles.accordionContent}>
                <Text style={profileStyles.subText}>Conteúdo das Configurações</Text>
              </View>
            )}
          </View>

          <View style={profileStyles.accordionItem}>
            <TouchableOpacity onPress={() => toggleAccordion("settings")} activeOpacity={0.7}>
              <Text style={profileStyles.accordionTitle}>Configurações</Text>
            </TouchableOpacity>
            {openSection === "settings" && (
              <View style={profileStyles.accordionContent}>
                <Text style={profileStyles.subText}>Conteúdo das Configurações</Text>
              </View>
            )}
          </View>

        </View>

      </ScrollView> 
    </ScreenLayout>
  );
}
