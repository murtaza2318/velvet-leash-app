import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS, FONT_POPPINS } from '../../utils/theme';
import { CustomText } from '../../components/CustomText';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { AuthStackNavigationType } from '../../utils/types/NavigationTypes';
import {
  PET_TYPES,
  PET_SIZE_LABELS,
  PET_AGE_LABELS,
  convertCompatibilityToBoolean,
  getPetSizeValue,
  getPetAgeValue,
} from '../../utils/constants';
import { useCreatePetMutation } from '../../redux/apis/pets.api';
import { useAppSelector } from '../../redux/store';

interface PetDetailsForm {
  size: string;
  age: string;
  friendlyWithDogs: 'Yes' | 'No' | 'Unsure' | '';
  friendlyWithCats: 'Yes' | 'No' | 'Unsure' | '';
}

type RouteParams = {
  initialData: {
    petType: string;
    dates: string;
    location: string;
  };
};

const PetDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp<AuthStackNavigationType>>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const initialData = route.params?.initialData || {
    petType: 'Dog',
    dates: '',
    location: '',
  };

  const userId = useAppSelector(state => state.userSlice.id);
  const [error, setError] = useState('');
  const [createPet, { isLoading: loading }] = useCreatePetMutation();

  const [formData, setFormData] = useState<PetDetailsForm>({
    size: '',
    age: '',
    friendlyWithDogs: '',
    friendlyWithCats: '',
  });

  const handleSubmit = async () => {
    setError('');
    try {
      const dogsCompatibility = convertCompatibilityToBoolean(formData.friendlyWithDogs);
      const catsCompatibility = convertCompatibilityToBoolean(formData.friendlyWithCats);
      const petTypeValue = initialData.petType.toLowerCase() === 'dog' ? PET_TYPES.DOG : PET_TYPES.CAT;
      
      const payload = {
        name: `Pet-${Date.now()}`,
        type: petTypeValue,
        size: getPetSizeValue(formData.size || 'Medium (26-60 lbs)'),
        age: getPetAgeValue(formData.age || 'Adult (3-7 years)'),
        getAlongWithDogs: dogsCompatibility.getAlong,
        getAlongWithCats: catsCompatibility.getAlong,
        isUnsureWithDogs: dogsCompatibility.isUnsure,
        isUnsureWithCats: catsCompatibility.isUnsure,
        specialInstructions: '',
        medicalConditions: '',
        userId,
      };

      await createPet(payload).unwrap();

      navigation.navigate('BoardingSearch', {
        location: initialData.location,
        dates: initialData.dates,
      });
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to save pet details. Please try again.');
    }
  };

  const SelectionButton = ({
    selected,
    onPress,
    label,
    style = {},
  }: {
    selected: boolean;
    onPress: () => void;
    label: string;
    style?: object;
  }) => (
    <TouchableOpacity
      style={[styles.selectionButton, selected && styles.selectedButton, style]}
      onPress={onPress}
    >
      <CustomText textStyle={[styles.buttonText]}>{label}</CustomText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <CustomText textStyle={styles.title}>
            Tell us about your {initialData.petType.toLowerCase()}s
          </CustomText>

          {error ? <CustomText textStyle={styles.errorText}>{error}</CustomText> : null}

          {/* Pet Size */}
          <View style={styles.section}>
            <CustomText textStyle={styles.sectionTitle}>
              {initialData.petType} size (lbs)
            </CustomText>
            <View style={styles.optionsRow}>
              {Object.values(PET_SIZE_LABELS).map((label) => (
                <SelectionButton
                  key={label}
                  selected={formData.size === label}
                  onPress={() => setFormData((prev) => ({ ...prev, size: label }))}
                  label={label}
                  style={styles.sizeButton}
                />
              ))}
            </View>
          </View>

          {/* Pet Age */}
          <View style={styles.section}>
            <CustomText textStyle={styles.sectionTitle}>
              How old are your {initialData.petType.toLowerCase()}s?
            </CustomText>
            <View style={styles.optionsRow}>
              {Object.values(PET_AGE_LABELS).map((label) => (
                <SelectionButton
                  key={label}
                  selected={formData.age === label}
                  onPress={() => setFormData((prev) => ({ ...prev, age: label }))}
                  label={label}
                  style={styles.ageButton}
                />
              ))}
            </View>
          </View>

          {/* Compatibility Dogs */}
          <View style={styles.section}>
            <CustomText textStyle={styles.sectionTitle}>
              Does your {initialData.petType.toLowerCase()} get along with other dogs?
            </CustomText>
            <View style={styles.optionsRow}>
              {['Yes', 'No', 'Unsure'].map((option) => (
                <SelectionButton
                  key={option}
                  selected={formData.friendlyWithDogs === option}
                  onPress={() => setFormData((prev) => ({ ...prev, friendlyWithDogs: option as any }))}
                  label={option}
                />
              ))}
            </View>
          </View>

          {/* Compatibility Cats */}
          <View style={styles.section}>
            <CustomText textStyle={styles.sectionTitle}>
              Does your {initialData.petType.toLowerCase()} get along with cats?
            </CustomText>
            <View style={styles.optionsRow}>
              {['Yes', 'No', 'Unsure'].map((option) => (
                <SelectionButton
                  key={option}
                  selected={formData.friendlyWithCats === option}
                  onPress={() => setFormData((prev) => ({ ...prev, friendlyWithCats: option as any }))}
                  label={option}
                />
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <CustomText textStyle={styles.searchButtonText}>Search Now</CustomText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  title: {
    fontSize: RFValue(24),
    fontFamily: FONT_POPPINS.semiBoldFont,
    color: COLORS.TextPrimary,
    marginBottom: 30,
  },
  errorText: {
    color: '#FF0000',
    fontSize: RFValue(14),
    fontFamily: FONT_POPPINS.regularFont,
    marginBottom: 15,
  },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: RFValue(16),
    fontFamily: FONT_POPPINS.mediumFont,
    color: COLORS.TextPrimary,
    marginBottom: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: '#E6E9E3',
    borderColor: '#E6E9E3',
  },
  buttonText: {
    fontSize: RFValue(14),
    fontFamily: FONT_POPPINS.regularFont,
    color: COLORS.TextPrimary,
    textAlign: 'center',
  },
  sizeButton: { minWidth: 90 },
  ageButton: { minWidth: 140 },
  searchButton: {
    backgroundColor: '#8FA77F',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontFamily: FONT_POPPINS.mediumFont,
  },
});

export default PetDetailsScreen;
