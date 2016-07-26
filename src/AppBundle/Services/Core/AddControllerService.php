<?php
namespace AppBundle\Services\Core;

use Symfony\Component\HttpFoundation\Request;
use CoreBundle\Entity\Admin\Candidat;

/**
 * Class AddControllerService
 * @package CoreBundle\Services\Core
 */
class AddControllerService extends AbstractControllerService
{
       /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function executeRequestAddAction(Request $request)
    {
        $this->initBothForms();
        $this->formAdd->handleRequest($request);
        if ($this->formAdd->isSubmitted() && $this->formAdd->isValid()) {
            $return = $this->get($this->servicePrefix.'.'.strtolower($this->entity).'_manager')->add($request->request->get(strtolower($this->checkFormEntity($this->entity))));
            if($this->entity == 'ScreenOrder') {

            }
        }
        return $this->get('core.index.controller_service')->getFullList($this->isArchived, $this->formAdd, $this->formEdit);
    }
}