<script lang="ts">

import Icon from '@iconify/svelte';

import instagram from '@iconify-icons/arcticons/instagram';
import youtube from '@iconify-icons/arcticons/youtube';

</script>

<footer class="col-start-1 col-span-32 row-start-18 row-span-1 px-4 flex justify-between items-center text-sm">
    <p>Desarrollado por Kooldeveloper.</p>
    <div class="flex gap-4">
        <a href="https://www.instagram.com/alejoelcoach/" target="_blank" rel="noopener noreferrer">
            <div class="inline-flex bg-linear-to-tl from-[#F58529] via-[#DD2A7B] to-[#515BD4] rounded-full text-white p-1 font-extrabold hover:brightness-150">
                <Icon icon={instagram} class="w-6 h-6" />
            </div>
        </a>
        <a href="https://www.youtube.com/@alejopinapena" target="_blank" rel="noopener noreferrer">
            <div class="inline-flex bg-red-600 rounded-full text-white p-1 hover:brightness-200">
                <Icon icon={youtube} class="w-6 h-6" />
            </div>
        </a>
    </div>
</footer>
