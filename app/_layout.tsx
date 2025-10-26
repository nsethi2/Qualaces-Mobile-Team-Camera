import { Stack } from "expo-router";

export default function RootLayout() {

    return(
    <Stack>
        <Stack.Screen 
            name="index" // This corresponds to app/index.tsx
            options={{ 
            title: 'Camera', 
        }} 
      />
        <Stack.Screen 
        name="gallery" // This corresponds to app/index.tsx
        options={{ 
        title: 'Gallery', 
        }} 
      />
      <Stack.Screen 
        name="preview" // Corresponds to app/preview.tsx
        options={{ 
          headerTitle: 'Text Preview', 
        }} 
      />      
    </Stack>
      );
}