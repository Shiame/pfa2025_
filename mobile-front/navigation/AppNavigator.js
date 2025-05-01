import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddPlainte from '../screens/AddPlainte';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MesPlaintesScreen from '../screens/MesPlaintesScreen';
import DetailPlainte from '../screens/DetailPlainte';



const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Soumettre une plainte" component={AddPlainte} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="mes plaintes" component={MesPlaintesScreen}/>
                <Stack.Screen name="Details de Plainte" component={DetailPlainte}/>


            </Stack.Navigator>

        </NavigationContainer>
    );
}
