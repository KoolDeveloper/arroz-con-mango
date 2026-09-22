<script lang="ts">

import Icon from '@iconify/svelte';

import instagram from '@iconify-icons/arcticons/instagram';
import youtube from '@iconify-icons/arcticons/youtube';

</script>

<footer class="col-start-1 col-span-32 row-start-18 row-span-1 border-2 border-primary bg-surface px-4 flex justify-between items-center text-sm">
    <p>Desarrollado por Kooldeveloper.</p>
    <div class="flex gap-4">
        <a href="https://www.instagram.com/alejoelcoach/" target="_blank" rel="noopener noreferrer">
            <Icon icon={instagram} class="w-6 h-6" />
        </a>
        <a href="https://www.youtube.com/@alejopinapena" target="_blank" rel="noopener noreferrer">
            <Icon icon={youtube} class="w-6 h-6" />
        </a>
    </div>
</footer>
